'use strict';

const config = require('./lib/config.js');
const Alexa = require('alexa-sdk');
const https = require('./lib/https.js');
var welcomeMessage = " Nashville Neighbors. You can ask me for public community resource information,  or  say help. What will it be?";

var welcomeReprompt = "You can ask me for a community resource category, or  say help. What will it be?";

var HelpMessage = "Here are some things you  can say: Give me community resource information. Tell me about Nashville Neighbors.  What would you like to do?";

var goodbyeMessage = "OK, thanks for being a Nashville Neighbor.";

var output = "";


var newSessionHandlers = {
    'LaunchRequest': function() {

        output = welcomeMessage;

        this.emit(':ask', output, welcomeReprompt);
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

    https.get(config.communityDataHost, config.communityDataPath, function(err, data){
      if (err) {
        console.error(err);
        return;
      }
      console.log(data);
      var alexa = Alexa.handler(event, context);
      alexa.registerHandlers(newSessionHandlers);
      alexa.execute();
    });
};
