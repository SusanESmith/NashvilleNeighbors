'use strict';

const config = require("./lib/config.js");
const Alexa = require('alexa-sdk');
const https = require('https');
const alexa = "";
var welcomeMessage = " Nashville Neighbors. You can ask me for public community resource information,  or  say help. What will it be?";

var welcomeReprompt = "You can ask me for a community resource category, or  say help. What will it be?";

var newSessionHandlers = {
    'LaunchRequest': function() {

        output = welcomeMessage;

        this.emit(':ask', output, welcomeReprompt);
    }};

module.exports.index = (event, context, callback) => {
  alexa = Alexa.handler(event, context);
  alexa.registerHandlers(newSessionHandlers);
  alexa.execute();
};
