'use strict';
const AWSMock = require('aws-sdk-mock');

describe('Update an user', () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'update', (params, callback) => {
        if (params.Key.Id === 1) callback(null, {});
        callback(null, {
            Attributes: {
                Id: 2,
                name: 'Wagner Mattei',
                email: 'wagner.mattei@gmail.com'
            }
        });
    });
    const handler = require('../functions/update-user/main');

    const user = { name: 'Wagner Mattei', email: 'wagner.mattei@gmail.com' };

    describe('Whit valid Id', () => {
        let response;
        beforeAll(async () => {
            response = await handler.lambdaHandler({ pathParameters: { id: 2 }, body: JSON.stringify(user) });
        });

        test('The status should be 200', () => {
            expect(response.statusCode).toBe(200);
        });

        test('The message should be Updated', () => {
            const message = JSON.parse(response.body).message;
            expect(message).toBe('Updated succesfully!');
        });

        test('The data should be the updated user', () => {
            const deletedUser = JSON.parse(response.body).data;
            expect(deletedUser).toMatchObject(user);
        });
    });

    describe('Whit wrong Id', () => {
        let response;
        beforeAll(async () => {
            response = await handler.lambdaHandler({ pathParameters: { id: 1 }, body: JSON.stringify(user) });
        });

        test('The status should be 404', () => {
            expect(response.statusCode).toBe(404);
        });

        test('The message should be User not found', () => {
            const message = JSON.parse(response.body).message;
            expect(message).toBe('User not found');
        });
    });
});
