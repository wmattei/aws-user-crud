const AWS = require('aws-sdk');

const dynamoOptions = { endpoint: process.env.AWS_SAM_LOCAL === 'true' ? 'http://dynamodb:8000' : null };
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const TABLE_NAME = 'auc_users';

exports.lambdaHandler = async () => {
    try {
        const dbResponse = await dynamo
            .scan({
                TableName: TABLE_NAME
            })
            .promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                data: dbResponse.Items
            })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Something went wrong!',
                data: error
            })
        };
    }
};
