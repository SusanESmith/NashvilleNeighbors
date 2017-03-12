'use strict';

const config = require('./lib/config.js');
const Alexa = require('alexa-sdk');
const https = require('./lib/https.js');
const utils = require('./lib/utils.js');

var welcomeMessage = " Nashville Neighbors. You can ask me for public community resource information, or say help. What will it be?";

var welcomeReprompt = "You can ask me for a community resource category, or say help. What will it be?";

var HelpMessage = "Here are some things you can say: Give me community resource information. Tell me about Nashville Neighbors.  What would you like to do?";

var goodbyeMessage = "OK, thanks for being a Nashville Neighbor.";

var noCategoryErrorMessage = "There was an error finding this category, " + tryAgainMessage;

var moreCategoryInfo = " You can tell me a category for more information. For example tell me more about Food Assistance.";

var getMoreInfoRepromptMessage = "What category would you like to hear about?";

var noNeighborErrorMessage = "There was an error finding this neighbor, " + tryAgainMessage;

var moreInformation = "See your Alexa app for more information."

var getMoreInfoMessage = "OK, " + getMoreInfoRepromptMessage;

var tryAgainMessage = "please try again."

var output = "";

var newSessionHandlers = {
    'LaunchRequest': function() {
        output = welcomeMessage;
        this.emit(':ask', output, welcomeReprompt);
    },
    'getOverview': function() {
        output = welcomeMessage;
        this.emit(':ask', output, welcomeReprompt);
    },

    'getCompleteCategoryListIntent': function() {
        var context = this;
        https.get(config.communityDataHost, config.communityDataPath, function(err, data) {
            if (err) {
                console.error(err);
                context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
                return;
            }

            var excludeArr = [];

            data = JSON.parse(data);

            var finalArr = data.filter(function(element) {
                if (excludeArr.indexOf(element.contact_type) !== -1 || config.excludedCategories.indexOf(element.contact_type.toLowerCase()) !== -1) {
                    return false;
                } else {
                    excludeArr.push(element.contact_type);
                    return true;
                }
            });

            var categories = "";
            finalArr.forEach(function(contact) {
                categories = contact.contact_type + ", " + categories;
            });

            categories = utils.contentCleanUp(categories);

            output = "Here is a list of community resources available in Nashville, " + categories;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'getMoreInfoByCategoryIntent': function() {
        var context = this,
            slotValue = context.event.request.intent.slots.category.value;
        https.get(config.communityDataHost, config.communityDataPath, function(err, data) {
            if (err) {
                console.error(err);
                context.emit(':tell', noCategoryErrorMessage, welcomeReprompt);
                return;
            }

            data = JSON.parse(data);

            data = data.filter(function(contact) {
                if (contact.contact_type.toLowerCase().includes(slotValue.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            });

            var contacts = "";
            data.forEach(function(contact) {
                contacts = contact.contact + ", " + contacts;
            });

            contacts = utils.contentCleanUp(contacts);

            output = "Here is a list of " + slotValue + " neighbors available in Nashville, " + contacts;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'getMoreInfoByNeighborIntent': function() {
        var context = this,
            slotValue = context.event.request.intent.slots.neighbor.value;
        https.get(config.communityDataHost, config.communityDataPath, function(err, data) {
            if (err) {
                console.error(err);
                context.emit(':tell', noNeighborErrorMessage, welcomeReprompt);
                return;
            }

            data = JSON.parse(data);

            data = data.filter(function(contact) {
                if (contact.contact.toLowerCase().includes(slotValue.toLowerCase())) {
                    return true;
                } else {
                    return false;
                }
            });

            var neighborInfo = "";
            data.forEach(function(contact) {
                neighborInfo = contact.contact + ", " + neighborInfo;
            });

            neighborInfo = utils.contentCleanUp(neighborInfo);

            output = "Here is some information about " + slotValue + " in Nashville, " + neighborInfo;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'Unhandled': function() {
        output = HelpMessage;
        this.emit(':ask', output, welcomeReprompt);
    },
    'AMAZON.StopIntent': function() {
        this.emit(':tell', goodbyeMessage);
    },
    'SessionEndedRequest': function() {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    }
};

module.exports.index = (event, context, callback) => {
    console.log("INTENT: " + event.request.intent.name);
    console.log("SLOTS:");
    console.log(event.request.intent.slots);
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers);
    alexa.execute();
};
