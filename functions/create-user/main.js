const AWS = require('aws-sdk');

const dynamoOptions = { endpoint: 'http://dynamodb:8000' };
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const TABLE_NAME = 'auc_users';

const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

exports.lambdaHandler = async (event) => {
    try {
        const user = { ...JSON.parse(event.body), Id: generateId() };
        await dynamo
            .put({
                TableName: TABLE_NAME,
                Item: user,
            })
            .promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Created!',
                data: user,
            }),
        };
    } catch (error) {
        console.error(error);
        return error;
    }
};
