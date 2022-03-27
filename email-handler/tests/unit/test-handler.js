'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var context;
const AWS = require('aws-sdk-mock');

let mockEvent = {
    Records: [
        {
            ses: {
                mail: {
                    messageId: 'email.eml'
                }
            }
        }
    ]
}

AWS.mock('S3', 'getObject', { Body: Buffer.from(require('fs').readFileSync('email.eml')) });
AWS.mock('S3', 'putObject', undefined);

describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await app.lambdaHandler(mockEvent, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body.key).to.be.equal("test-camera/moose_640.jpg");
    });
});
