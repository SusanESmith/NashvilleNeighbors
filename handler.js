'use strict';

const config = require('./lib/config.js');
const Alexa = require('alexa-sdk');
const https = require('./lib/https.js');

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

var states = {
    SEARCHMODE: '_SEARCHMODE',
    CATEGORIES: '_CATEGORIES',
    NEIGHBOR: '_NEIGHBOR'
};

var newSessionHandlers = {
    'LaunchRequest': function() {
        output = welcomeMessage;
        this.emit(':ask', output, welcomeReprompt);
    },
    'getOverview': function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState('getOverview');
    },

    'getCompleteCategoryListIntent': function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState('getCompleteCategoryListIntent');
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

var startSearchHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {
    'AMAZON.HelpIntent': function() {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
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

            var finalArr = data.filter(function(element) {
                if (excludeArr.indexOf(element.contact_type) !== -1 || config.excludedCategories.indexOf(element.contact_type.toLowerCase()) !== -1) {
                    return false;
                } else {
                    excludeArr.push(element.contact_type);
                    return true;
                }
            });

            var categories "";
            finalArr.forEach(function(contact) {
                categories = categories + contact.contact_type;
            });

            output = "Here is a list of community resources available in Nashville: " + categories;
            context.emit(':tell', output, getMoreInfoRepromptMessage);
        });
    },

    'AMAZON.YesIntent': function() {
        output = HelpMessage;
        this.emit(':ask', output, HelpMessage);
    },

    'AMAZON.NoIntent': function() {
        output = HelpMessage;
        this.emit(':ask', HelpMessage, HelpMessage);
    },

    'AMAZON.StopIntent': function() {
        this.emit(':tell', goodbyeMessage);
    },

    'AMAZON.RepeatIntent': function() {
        this.emit(':ask', output, HelpMessage);
    },
    'SessionEndedRequest': function() {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function() {
        output = HelpMessage;
        this.emit(':ask', output, welcomeReprompt);
    }
});

module.exports.index = (event, context, callback) => {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};
