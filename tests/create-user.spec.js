'use strict';
const AWSMock = require('aws-sdk-mock');

require('dotenv').config();

describe('Creates a new user', () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback(null, '');
    });
    const handler = require('../functions/create-user/main');

    const user = { name: 'John Watson' };
    let response;
    beforeAll(async () => {
        response = await handler.lambdaHandler({ body: JSON.stringify(user) });
    });

    test('The status should be 201', () => {
        expect(response.statusCode).toBe(201);
    });

    test('The message should be Created', () => {
        const message = JSON.parse(response.body).message;
        expect(message).toBe('Created!');
    });

    test('The data should be the inserted user', () => {
        const savedUser = JSON.parse(response.body).data;
        expect(savedUser).toMatchObject(user);
    });
});
