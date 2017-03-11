var Alexa = require('alexa-sdk');
var http = require('http');

var states = {
  SEARCHMODE: '_SEARCHMODE',
  CATEGORIES: '_CATEGORIES',
  NEIGHBOR: '_NEIGHBOR'
};

var welcomeMessage = " Nashville Neighbors. You can ask me for public community resource information,  or  say help. What will it be?";

var HelpMessage = "Here are some things you  can say: Give me community resource information. Tell me about Nashville Neighbors.  What would you like to do?";

var moreInformation = "See your  Alexa app for  more  information."

var tryAgainMessage = "please try again."

var noCategoryErrorMessage = "There was an error finding this category, " + tryAgainMessage;

var noNeighborErrorMessage = "There was an error finding this neighbor, " + tryAgainMessage;

var moreCategoryInfo = " You can tell me a category for more information. For example tell me more about Food Assistance.";

var getMoreInfoRepromptMessage = "What category would you like to hear about?";

var getMoreInfoMessage = "OK, " + getMoreInfoRepromptMessage;

var goodbyeMessage = "OK, thanks for being a Nashville Neighbor.";

//var hearMoreMessage = "Would you like to hear about category top thing that you can do in " + location + "?";

var alexa;

var newline = "\n";

var output = "";

var newSessionHandlers = {
    'LaunchRequest': function() {
        this.handler.state = states.SEARCHMODE;

        output = welcomeMessage;

        this.emit(':ask', output, welcomeReprompt);
    },
    'getCompleteCategoryListIntent': function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState('getCompleteCategoryListIntent');
    },
    'getMoreInfoByCategoryIntent': function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState('getMoreInfoByCategoryIntent');
    },
    'getOverview': function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState('getOverview');
    },
    'getMoreInfoByNeighborIntent': function() {
        this.handler.state = states.SEARCHMODE;
        this.emitWithState('getMoreInfoByNeighborIntent');
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

var startSearchHandlers = Alexa.CreateStateHandler(status.SEARCHMODE, {
  'AMAZON.HelpIntent' : function() {
    output = HelpMessage;
    this.emit(':ask', output, HelpMessage);
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
      this.emit(':ask', output, welcomeRepromt);
  }
});

exports.handler = function(event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startSearchHandlers);
    alexa.execute();
};

// Create a web request and handle the response.
function httpGet(query, callback) {
    console.log("/n QUERY: " + query);

/*figure out how to access nashville.gov api */
    // var options = {
    //     //http://api.nytimes.com/svc/search/v2/articlesearch.json?q=Fayetteville&sort=newest&api-key=
    //     host: 'api.nytimes.com',
    //     path: '/svc/search/v2/articlesearch.json?q=' + query + '&sort=newest&api-key=' + APIKey,
    //     method: 'GET'
    // };

    var req = http.request(options, (res) => {

        var body = '';

        res.on('data', (d) => {
            body += d;
        });

        res.on('end', function() {
            callback(body);
        });

    });
    req.end();

    req.on('error', (e) => {
        console.error(e);
    });
}

String.prototype.trunc =
    function(n) {
        return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
    };
