'use strict';

const config = require('./lib/config.js');
const Alexa = require('alexa-sdk');
const https = require('./lib/https.js');
const utils = require('./lib/utils.js');

var welcomeMessage = "We are your Neighbors of Nashville. You can ask us for public community resource information, or say help. What will it be?";

var welcomeReprompt = "You can ask me for a community resource category, for information on a specific neighbor, or say help. What will it be?";

var HelpMessage = "Here are some things you can say: Give me community resource information. Tell me about Neighbors of Nashville.  What would you like to do?";

var goodbyeMessage = "OK, thanks for being a Neighbors of Nashville.";

var tryAgainMessage = "please try again."

var noCategoryErrorMessage = "There was an error finding this category, " + tryAgainMessage;

var getMoreInfoRepromptMessage = "What category would you like to hear about?";

var noNeighborErrorMessage = "There was an error finding this neighbor, " + tryAgainMessage;

var output = "";

var newSessionHandlers = {
    'LaunchRequest': function () {
        output = welcomeMessage;
        this.emit(':ask', output, welcomeReprompt);
    },
    'getOverview': function () {
        output = welcomeMessage;
        this.emit(':ask', output, welcomeReprompt);
    },

    'getCompleteCategoryListIntent': function () {
        var context = this;
        https.get(config.communityDataHost, config.communityDataPath, function (err, data) {
            if (err) {
                console.error(err);
                context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
                return;
            }

            data = utils.contentCleanUp(data);

            data = JSON.parse(data);

            var excludeArr = [];

            var excludedCategories = JSON.parse(utils.contentCleanUp(JSON.stringify(config.excludedCategories)));

            var finalArr = data.filter(function (element) {
                if (excludeArr.indexOf(element.contact_type) !== -1 || excludedCategories.indexOf(element.contact_type.toLowerCase()) !== -1) {
                    return false;
                } else {
                    excludeArr.push(element.contact_type);
                    return true;
                }
            });

            var categories = "";
            finalArr.forEach(function (contact) {
                categories = contact.contact_type + ", " + categories;
            });

            categories = utils.contentCleanUp(categories);

            output = "Here is a list of community resource categories available in Nashville, " + categories;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'getMoreInfoByCategoryIntent': function () {
        var context = this;

        if (context.event.request.hasOwnProperty('intent') && context.event.request.intent.hasOwnProperty('slots') && context.event.request.intent.slots.hasOwnProperty('category') && context.event.request.intent.slots.neighbor.hasOwnProperty('value')) {
            var slotValue = context.event.request.intent.slots.category.value;
        } else {
            console.error("No value in category slot");
            context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
            return;
        }

        https.get(config.communityDataHost, config.communityDataPath, function (err, data) {
            if (err) {
                console.error(err);
                context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
                return;
            }

            data = utils.contentCleanUp(data);

            data = JSON.parse(data);

            if (!data || data.length === 0) {
                console.error("Error retrieving data");
                context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
                return;
            }

            data = data.filter(function (contact) {
                if (contact.hasOwnProperty('contact_type') && data[0].hasOwnProperty('contact') && contact.contact_type.toLowerCase().includes(slotValue.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            });

            if (!data || data.length === 0) {
                console.error("Error retrieving data");
                context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
                return;
            }

            var contacts = "";
            data.forEach(function (contact) {
                contacts = contact.contact + ", " + contacts;
            });

            contacts = utils.contentCleanUp(contacts);

            output = "Here is a list of " + slotValue + " neighbors available in Nashville, " + contacts;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'getMoreInfoByNeighborIntent': function () {
        var context = this
        
        if (context.event.request.hasOwnProperty('intent') && context.event.request.intent.hasOwnProperty('slots') && context.event.request.intent.slots.hasOwnProperty('neighbor') && context.event.request.intent.slots.neighbor.hasOwnProperty('value')) {
            var slotValue = context.event.request.intent.slots.neighbor.value;
        } else {
            console.error("No value in neighbor slot");
            context.emit(':tell', noNeighborErrorMessage, welcomeReprompt);
            return;
        }

        https.get(config.communityDataHost, config.communityDataPath, function (err, data) {
            if (err) {
                console.error(err);
                context.emit(':tell', noNeighborErrorMessage, welcomeReprompt);
                return;
            }

            data = utils.contentCleanUp(data);

            data = JSON.parse(data);

            if (!data || data.length === 0) {
                console.error("Error retrieving data");
                context.emit(':tell', noNeighborErrorMessage, welcomeReprompt);
                return;
            }

            data = data.find(function (contact) {
                if (contact.hasOwnProperty('contact') && contact.contact.toLowerCase().includes(slotValue.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            });

            if (!data || !data[0].hasOwnProperty('contact_type')) {
                console.error("Error retrieving data");
                context.emit(':tell', noNeighborErrorMessage, welcomeReprompt);
                return;
            }

            var neighborInfo = data.contact + " is a " + data.contact_type + " service,";

            if (data.location_1_address) {
                neighborInfo = neighborInfo + " they are located at " + data.location_1_address + " in Nashville, TN, ";
            }

            if (data.phone_number) {
                neighborInfo = neighborInfo + ", their phone number is " + data.phone_number + ".";
            }

            neighborInfo = utils.contentCleanUp(neighborInfo);

            output = neighborInfo;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'Unhandled': function () {
        output = HelpMessage;
        this.emit(':ask', output, welcomeReprompt);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', goodbyeMessage);
    },
    'SessionEndedRequest': function () {
        this.emit('AMAZON.StopIntent');
    }
};

module.exports.index = (event, context) => {
    if (event.request.hasOwnProperty('intent') && event.request.intent.hasOwnProperty('name')) {
        console.log("INTENT: " + event.request.intent.name);
    }
    if (event.request.hasOwnProperty('intent') && event.request.intent.hasOwnProperty('slots')) {
        console.log("SLOTS:");
        console.log(event.request.intent.slots);
    }
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers);
    alexa.execute();
};