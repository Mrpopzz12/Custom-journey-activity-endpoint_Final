'use strict';
const axios = require("axios");

// In-memory log of last N SFMC calls (for debugging)
let debugLog = [];

function logCall(route, req) {
    debugLog.push({
        route: route,
        method: req.method,
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString()
    });

    if (debugLog.length > 20) debugLog.shift();
}

// Debug endpoint
exports.debugLog = function (req, res) {
    return res.status(200).json(debugLog);
};

/*
 * EDIT
 */
exports.edit = function (req, res) {
    logCall('edit', req);
    return res.status(200).json({ success: true });
};

/*
 * SAVE
 */
exports.save = function (req, res) {
    logCall('save', req);
    return res.status(200).json({ success: true });
};

/*
 * EXECUTE (MAIN LOGIC)
 */
exports.execute = async function (req, res) {
    logCall('execute', req);

    try {
        console.log('=== Execute called ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const args = req.body?.inArguments?.[0] || {};

        // ✅ Endpoint URL
        const endpointUrl = (args.endpointUrl || process.env.ENDPOINT_URL || '').trim();

        // ✅ Parse EventData (ALL Entry DE fields)
        let eventData = args.EventData;
        if (typeof eventData === "string") {
            try {
                eventData = JSON.parse(eventData);
            } catch (e) {
                console.warn('⚠️ Failed to parse EventData, using raw value');
            }
        }

        // ✅ Journey Context
        const journeyContext = args.journeyContext || {};

        // ✅ Final Payload
        const endpointPayload = {
            contact: {
                contactKey: args.ContactKey || null,
                email: args.EmailAddress || null
            },
            eventData: eventData || {},
            journeyContext: journeyContext || {},
            meta: {
                receivedAt: new Date().toISOString()
            }
        };

        console.log('Endpoint URL:', endpointUrl);
        console.log('Final Payload:', JSON.stringify(endpointPayload, null, 2));

        // ❌ Validate endpoint
        if (!endpointUrl) {
            console.error('❌ Missing endpointUrl');
            return res.status(200).json({
                success: false,
                outArguments: [{ success: false, error: "Missing endpointUrl" }]
            });
        }

        // 🚀 Call external API
        const response = await postToEndpoint(endpointUrl, endpointPayload);

        console.log('✅ External API Success');

        return res.status(200).json({
            success: true,
            outArguments: [
                {
                    success: true,
                    response: response || null
                }
            ]
        });

    } catch (error) {
        console.error('❌ Execute error:', error.response ? error.response.data : error.message);

        return res.status(200).json({
            success: false,
            outArguments: [
                {
                    success: false,
                    error: error.message
                }
            ]
        });
    }
};

/*
 * VALIDATE
 */
exports.validate = function (req, res) {
    logCall('validate', req);

    console.log('=== Validate called ===');
    console.log('Validate body:', JSON.stringify(req.body, null, 2));

    return res.status(200).json({
        valid: true,
        errors: []
    });
};

/*
 * PUBLISH
 */
exports.publish = function (req, res) {
    logCall('publish', req);
    console.log('=== Publish called ===');

    return res.status(200).json({ success: true });
};

/*
 * STOP
 */
exports.stop = function (req, res) {
    logCall('stop', req);
    return res.status(200).json({ success: true });
};

/*
 * TEST ENDPOINT (Manual testing)
 */
exports.testEndpoint = async function (req, res) {
    try {
        const endpointUrl = (req.body?.endpointUrl || '').trim();

        if (!endpointUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing endpointUrl'
            });
        }

        const testPayload = {
            test: true,
            timestamp: new Date().toISOString()
        };

        const response = await axios.post(endpointUrl, testPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        return res.status(200).json({
            success: true,
            status: response.status,
            response: response.data
        });

    } catch (error) {
        const msg = error.response
            ? `${error.response.status} - ${JSON.stringify(error.response.data)}`
            : error.message;

        return res.status(200).json({
            success: false,
            error: msg
        });
    }
};

/*
 * Helper: POST to external endpoint
 */
async function postToEndpoint(endpointUrl, payload) {
    console.log('➡️ Posting to endpoint:', endpointUrl);

    const response = await axios.post(endpointUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
    });

    console.log('⬅️ Endpoint response:', response.status);
    return response.data;
}
