const AWS = require('aws-sdk');

const dynamoOptions = { endpoint: process.env.AWS_SAM_LOCAL === 'true' ? 'http://dynamodb:8000' : null };
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const TABLE_NAME = 'auc_users';

exports.lambdaHandler = async event => {
    try {
        const Id = event.pathParameters.id;
        const payload = JSON.parse(event.body);

        const response = await dynamo
            .update({
                TableName: TABLE_NAME,
                Key: { Id },
                UpdateExpression: 'SET #name = :name, #email = :email',
                ExpressionAttributeNames: {
                    '#name': 'name',
                    '#email': 'email'
                },
                ExpressionAttributeValues: {
                    ':name': payload.name,
                    ':email': payload.email
                },
                ReturnValues: 'ALL_NEW'
            })
            .promise();

        if (!response.Attributes) {
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
                message: 'Updated succesfully!',
                data: response.Attributes
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Something wrong happened',
                error
            })
        };
    }
};
