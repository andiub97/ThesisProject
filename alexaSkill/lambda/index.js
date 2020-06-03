// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const https = require('https');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const s3Attributes = await attributesManager.getPersistentAttributes() || {};
        const year = s3Attributes.hasOwnProperty('year') ? s3Attributes.year : 0;
        let speakOutput = 'Welcome, you can say I am a student of first, second or third year. Which year do you attend?';
        if( year !== 0){
            speakOutput = 'You can ask me about your lessons in a week specifying the name of the day, for example you can say: tell me the lessons for monday. ' +
            'You can ask if there are comunications about lessons interruption, or else, saying: tell me comunications for today or tomorrow or 23 april 2020. '+
            'You can ask me for an exam course details saying: tell me details about computer science fundamentals. What do you want to know? '
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// qui devo prendere l'anno di corso dell'utente, impostarlo in memoria 
const SetAttendedYearIntentHandler = {
        canHandle(handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'SetAttendedYearIntent';
            }, 
        async handle(handlerInput) {
            
            const attributesManager = handlerInput.attributesManager;
            
            const year = handlerInput.requestEnvelope.request.intent.slots.year.value;
            
            const attributes = await attributesManager.getSessionAttributes() || {};
            
            let s3Attributes = {"year" : year };
            
            attributesManager.setPersistentAttributes(s3Attributes);
            await attributesManager.savePersistentAttributes();
                    
                    return handlerInput.responseBuilder
                        .speak(`${s3Attributes.year}` + " has been set as your current year in computer science course")
                        .reprompt(``)
                        .getResponse()
                        //.withShouldEndSession(true)
                
                }
    
    };





const LessonTimetableIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'LessonTimetableIntent';
    },
   
    async handle(handlerInput) {
        
        let dayOfTheWeek = handlerInput.requestEnvelope.request.intent.slots.day.value
        
        const attributesManager = handlerInput.attributesManager;
        const s3Attributes = await attributesManager.getPersistentAttributes() || {};

        const year = s3Attributes.hasOwnProperty('year') ? s3Attributes.year : 0;
        
        let speakOutput = "", repromptOutput = 'ask me for another day of week';
        try {
            const response = await getLessonTimetableFromDB(dayOfTheWeek, year);
            speakOutput = ""+response;
            
            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
              
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to find data`)
                .reprompt(repromptOutput)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
}

        


function getLessonTimetableFromDB(giorno, anno) {
  return new Promise((resolve, reject) => {
    var options = {
        host: '4a66c134.ngrok.io',
        path: '/UniServiceREST/rest/getTimetable', 
        method: 'GET',
    };
    
    const request = https.request(options, (response) => { 
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => { 
        returnData += chunk;
      });

      response.on('end', () => {
        let i, o,  result = [], arr1 = [];
        
        let j = [ JSON.parse(returnData)];
        
        for( o in j){
            
            var onePart = j [JSON.parse(o)];
            
            for( i in onePart){
                                
                arr1[i] = (Object.values(onePart[i]));
            
                if((arr1[i][0] === anno) && (arr1[i][1] === giorno)){
                    result[i] = arr1[i][2] + " from " + arr1[i][3] + " to " +  arr1 [i][4]; 
                }
            }
        }
        resolve(result)
        
      });

      response.on('error', (error) => { reject(error) });
    });
    request.end();
  })
}

    
    
    
const GetComunicationIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetComunicationIntent';
    },
   
    async handle(handlerInput) {
        
        let day = handlerInput.requestEnvelope.request.intent.slots.date.value;
          
        const attributesManager = handlerInput.attributesManager;
        
        const s3Attributes = await attributesManager.getPersistentAttributes() || {};

        const year = s3Attributes.hasOwnProperty('year') ? s3Attributes.year : 0;
        
        let speakOutput = "", repromptOutput = ' Ask me for another day';
        try {
            
            const response = await GetComunicationFromDB(day, year);
            speakOutput = " " + response ;
            
            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
              
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to find data`)
                .reprompt(repromptOutput)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
}



function GetComunicationFromDB(day, year) {
  return new Promise((resolve, reject) => {
    var options = {
        host: '4a66c134.ngrok.io',
        path: '/UniServiceREST/rest/getComunication', 
        method: 'GET',
    };
    
    const request = https.request(options, (response) => { 
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => { 
        returnData += chunk;
      });

      response.on('end', () => {
        let i, o,  result = [], arr1 = [];
        
        let j = [ JSON.parse(returnData)];
        
        for( o in j){
            
            var onePart = j [JSON.parse(o)];
            
            for( i in onePart){
                                
                arr1[i] = (Object.values(onePart[i]));
            
                if((arr1[i][0] === year) && (arr1[i][1] === day)){
                    result[i] = arr1[i][2];
                }
            }
        }
        resolve(result)
      });
      response.on('error', (error) => { reject(error) });
    });
    request.end();
  })
}

const GetExamDescriptionIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GetExamDescriptionIntent';
    },
   
    async handle(handlerInput) {
        
        let exam = handlerInput.requestEnvelope.request.intent.slots.exam.value;
          
        const attributesManager = handlerInput.attributesManager;
        
        const s3Attributes = await attributesManager.getPersistentAttributes() || {};

        const year = s3Attributes.hasOwnProperty('year') ? s3Attributes.year : 0;
        
        let speakOutput = "", repromptOutput = ' Ask me for another day';
        try {
            
            const response = await GetExamDescriptionFromDB(exam);
            speakOutput = " " + response ;
            
            handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(repromptOutput)
              
        } catch(error) {
            handlerInput.responseBuilder
                .speak(`I wasn't able to find data`)
                .reprompt(repromptOutput)
        }
   
    return handlerInput.responseBuilder
        .getResponse();
    }
}

function GetExamDescriptionFromDB(exam) {
  return new Promise((resolve, reject) => {
    var options = {
        host: '4a66c134.ngrok.io',
        path: '/UniServiceREST/rest/getExamDetails', 
        method: 'GET',
    };
    
    const request = https.request(options, (response) => { 
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => { 
        returnData += chunk;
      });

      response.on('end', () => {
        let i, o,  result = [], arr1 = [];
        
        let j = [ JSON.parse(returnData)];
        
        for( o in j){
            
            var onePart = j [JSON.parse(o)];
            
            for( i in onePart){
                                
                arr1[i] = (Object.values(onePart[i]));
            
                if(arr1[i][0] === exam){
                    result[i] = arr1[i][1];
                }
            }
        }
        resolve(result)
      });
      response.on('error', (error) => { reject(error) });
    });
    request.end();
  })
}


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SetAttendedYearIntentHandler,
        LessonTimetableIntentHandler,
        GetComunicationIntentHandler,
        GetExamDescriptionIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler
    )
    .withPersistenceAdapter(
         new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .withApiClient(new Alexa.DefaultApiClient())
    .lambda();
