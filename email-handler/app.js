// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const AWS = require('aws-sdk');
const simpleParser = require('mailparser').simpleParser;
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    const s3 = new AWS.S3();

    const record = event.Records[0];

    const request = {
        Bucket: "trailcams-email-pool",
        Key: record.ses.mail.messageId,
    };

    try {
        console.log(`Getting object from S3 with key ${request.Key}`)
        const data = await s3.getObject(request).promise();

        console.log('Parsing email...');
        const email = await simpleParser(data.Body);
        
        const attachments = email.attachments;
        if(!attachments) {
            throw new Error('Email has no attachments.');
        }
        
        const toAddress = email.to.value[0].address;
        const username = toAddress.split('@')[0];
        
        const fromAddress = email.from.value[0].address;
        const cameraName = fromAddress.split('@')[0];

        const key = `${cameraName}/` + attachments[0].filename;
        
        const putParams = {
            Bucket: 'trailcams--' + username,
            Key: key,
            Body: attachments[0].content,
            ContentType: attachments[0].contentType,
            ContentDisposition: 'inline',
            Metadata: {
                timestamp: new Date().toISOString(),
            },
        }
        
        console.log(`Email from ${fromAddress} to ${toAddress} is being processed. Putting attachment to bucket ${putParams.Bucket} with key ${putParams.Key}`);
        await s3.putObject(putParams).promise();

        console.log('All done.');
        return { statusCode: 200, body: { key } };

    } catch (Error) {
        console.log(Error, Error.stack);
        return Error;
    }
};
