'use strict';
const AWSMock = require('aws-sdk-mock');

describe('Get the list of users', () => {
    AWSMock.mock('DynamoDB.DocumentClient', 'scan', (params, callback) => {
        callback(null, {
            Items: [
                {
                    Id: 1,
                    name: 'Wagner Mattei',
                    email: 'wagner.mattei@gmail.com'
                },
                {
                    Id: 2,
                    name: 'Donald Trump',
                    email: 'trump@us.gov'
                }
            ]
        });
    });
    const handler = require('../functions/get-users/main');
    let response;
    beforeAll(async () => {
        response = await handler.lambdaHandler();
    });

    test('The status should be 200', () => {
        expect(response.statusCode).toBe(200);
    });

    test('The data should contain 2 users', () => {
        const items = JSON.parse(response.body).data;
        expect(items.length).toBe(2);
    });

    test('The data should contain all attributes', () => {
        const items = JSON.parse(response.body).data;
        items.forEach(item => {
            expect(Object.keys(item)).toEqual([
                'Id',
                'name',
                'email',
                '_presignedOriginalPhoto',
                '_presignedCroppedPhoto'
            ]);
        });
    });
});
