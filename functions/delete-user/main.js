const AWS = require('aws-sdk');

const dynamoOptions = { endpoint: process.env.AWS_SAM_LOCAL === 'true' ? 'http://dynamodb:8000' : null };
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const TABLE_NAME = 'auc_users';

exports.lambdaHandler = async event => {
    const Id = event.pathParameters.id;
    const dbResponse = await dynamo
        .delete({
            TableName: TABLE_NAME,
            Key: {
                Id
            },
            ReturnValues: 'ALL_OLD'
        })
        .promise();

    if (!dbResponse.Attributes) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'User not found'
            })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Deleted succesfully!',
            data: dbResponse.Attributes
        })
    };
};
