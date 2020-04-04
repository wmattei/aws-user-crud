'use strict';
const AWSMock = require('aws-sdk-mock');

describe('Delete an user', () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
        if (params.Key.Id === 1) callback(null, {});
        callback(null, {
            Attributes: {
                Id: 2,
                name: 'Wagner Mattei',
                email: 'wagner.mattei@gmail.com'
            }
        });
    });
    const handler = require('../functions/delete-user/main');

    const user = { name: 'Wagner Mattei', email: 'wagner.mattei@gmail.com' };

    describe('Whit valid Id', () => {
        let response;
        beforeAll(async () => {
            response = await handler.lambdaHandler({ pathParameters: { id: 2 } });
        });

        test('The status should be 200', () => {
            expect(response.statusCode).toBe(200);
        });

        test('The message should be Deleted', () => {
            const message = JSON.parse(response.body).message;
            expect(message).toBe('Deleted succesfully!');
        });

        test('The data should be the deleted user', () => {
            const deletedUser = JSON.parse(response.body).data;
            expect(deletedUser).toMatchObject(user);
        });
    });
});
