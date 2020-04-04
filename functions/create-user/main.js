const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const dynamoOptions = { endpoint: process.env.AWS_SAM_LOCAL === 'true' ? 'http://dynamodb:8000' : null };
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const TABLE_NAME = 'auc_users';

exports.lambdaHandler = async event => {
    try {
        const user = { ...JSON.parse(event.body), Id: uuidv4() };
        await dynamo
            .put({
                TableName: TABLE_NAME,
                Item: user
            })
            .promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Created!',
                data: user
            })
        };
    } catch (error) {
        console.error(error);
        return error;
    }
};
