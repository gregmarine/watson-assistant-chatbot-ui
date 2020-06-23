const express = require('express');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');
const cheerio = require('cheerio');
const axios = require('axios');

const router = express.Router();

var assistant = new AssistantV2({
    version: '2020-04-01',
    authenticator: new IamAuthenticator({
      apikey: process.env.ASSISTANT_IAM_APIKEY
    }),
    url: process.env.ASSISTANT_URL
});

// New Watson Assistant service Session
router.get('/new-session', function(req, res) {
    
    assistant.createSession({
        assistantId: process.env.ASSISTANT_ID
    }, function(err, response) {
        var sessionData;
        if (err) {
          console.error(err);
        } else{
          console.log(JSON.stringify(response, null, 2));
          sessionData = res.json(response);
        }

        return sessionData;
    });
});

// Send message to Watson Assistant service
router.post('/message', function(req, res) {
    var assistantId = process.env.ASSISTANT_ID || '<assistant_id>';

    if (!assistantId || assistantId === '<assistant_id>') {
        return res.json({
            'output': {
                'text': 'The app has not been configured with an <b>assistantId</b> environment variable.'
            }
        });
    }

    var payload = {
        assistantId: assistantId,
        input: {}
    };

    if (req.body) {

        if (req.body.input) {
            payload.input = req.body.input;
        }
        
        if (req.body.session_id) {
            payload.sessionId = req.body.session_id;
        }

        assistant.message(payload, function(err, data) {
            var returnObject = null;
            if (err) {
                console.error(JSON.stringify(err, null, 2));
                returnObject = res.status(err.code || 500).json(err);
            } else {
                returnObject = res.json(data);
            }
            
            return returnObject;
        });
    }
});

module.exports = router;
