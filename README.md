# trailcams-email-handler

This project contains the source code for AWS Lambda Function trailcams-email-handler. The purpose of the function is to be triggered on SES email reception and to extract attachments from email messages and save them to S3.

## Prerequisites

AWS SAM CLI needs to be installed. Official instructions can be found here: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

## Build

```bash
$ sam build
```

## Test

```bash
$ cd email-handler
$ npm run test
```
