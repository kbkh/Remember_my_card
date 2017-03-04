/*'use strict';

console.log('Loading function');

exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    event.Records.forEach((record) => {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
    });
    callback(null, `Successfully processed ${event.Records.length} records.`);
};*/

'use strict';
var Alexa = require("alexa-sdk");
var appId = ''; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.dynamoDBTableName = 'highLowGuessUsers';
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers, guessAttemptHandlers);
    alexa.execute();
};

var states = {
    REGMODE: '_REGMODE', // User is registering a new card. 1st 4 digtis.
    REGMODETWO: '_REGMODETWO', // User is registering a new card. 2nd 4 digtis.
    REGMODETHREE: '_REGMODETHREE', // User is registering a new card. 3rd 4 digtis.
    REGMODEFOUR: '_REGMODEFOUR', // User is registering a new card. 4th 4 digtis.
    DELMODE: '_DELMODE'  // Alexa is delivering card info to the user.
};

var newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
        }
        this.handler.state = states.DELMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want information about? Give the first four digits of that card number');
    },
    "TOREG": function() {
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first four digits of your card number');
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }
};

var deliverInfoModeHandlers = Alexa.CreateStateHandler(states.DELMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'Give the first four numbers of the card you want information about.';
        this.emit(':ask', message, message);
    },
    'DELFIRST': function() {
        // Logic for finding card from database.
        this.emit(':tell', "I am finding the card information!");
    },
    // Intent for register mode. Give msg
    "TOREG": function() {
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first four digits of your card number');
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'I am still waiting for those four digits.';
        this.emit(':ask', message, message);
    }
});

var registerInfoModeHandlers = Alexa.CreateStateHandler(states.REGMODE, {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
        }
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first four digits of your card number');
    },
    //Intent for deliver mode
    "REGTODEL": function() {
        this.handler.state = states.DELMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want information about? Give the first four digits');
    },
    'FIRST': function() {
        // Save 1st 4 digits
        this.emit(':tell', "I am registering first 4!");
        // Change state for next 4 digits
        this.handler.state = states.REGMODETWO;
        // msg for next 4 digits
        this.emit(':ask', 'Please give the second four digits of your card number');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'Give the first four digits that appear on your card');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'I am still waiting for those four digits.', 'I am still waiting for those four digits.');
    }
});

var registerInfoModeTwoHandlers = Alexa.CreateStateHandler(states.REGMODETWO, {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
        }
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first 4 digits');
    },
    //Intent for deliver mode
    "REGTODEL": function() {
        this.handler.state = states.DELMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want information about? Give the first 4 digits');
    },
    'SECOND': function() {
        // Save 2nd 4 digits
        this.emit(':tell', "I am registering second 4!");
        // Change state for next 4 digits
        this.handler.state = states.REGMODETHREE;
        // msg for next 4 digits
        this.emit(':ask', 'Please give the third four digits of your card number');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'Give the second four digits that appear on your card');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'I am still waiting for those 4 digits.', 'I am still waiting for those four digits.');
    }
});

var registerInfoModeThreeHandlers = Alexa.CreateStateHandler(states.REGMODETHREE, {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
        }
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first four digits');
    },
    //Intent for deliver mode
    "REGTODEL": function() {
        this.handler.state = states.DELMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want information about? Give the first four digits');
    },
    'THIRD': function() {
        // Save 3rd 4 digits
        this.emit(':tell', "I am registering third 4!");
        // Change state for next 4 digits
        this.handler.state = states.REGMODEFOUR;
        // msg for next 4 digits
        this.emit(':ask', 'Please give the last four digits of your card number');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'Give the third four digits that appear on your card');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'I am still waiting for those four digits.', 'I am still waiting for those four digits.');
    }
});

var registerInfoModeFourHandlers = Alexa.CreateStateHandler(states.REGMODEFOUR, {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes['endedSessionCount'] = 0;
        }
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first four digits');
    },
    //Intent for deliver mode
    "REGTODEL": function() {
        this.handler.state = states.DELMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want information about? Give the first four digits');
    },
    "TOREG": function() {
        this.handler.state = states.REGMODE;
        this.emit(':ask', 'Welcome to your bank at home. What card do you want to register? Start by giving the first four digits of your card number');
    },
    'FOURTH': function() {
        // Save 4th 4 digits
        this.emit(':tell', "I am registering fourth 4!");
        // Save all digits
        this.emit(':tell', "Card successfully registered!");
        this.emit(':ask', 'What can I do for you next? Register a new Card? Give you the information for one of your cards? If my service is not needed anymore say stop.');
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'Give the last four digits that appear on your card');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");  
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'I am still waiting for those four digits.', 'I am still waiting for those four digits.');
    }
});