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

        const users = await Promise.all(
            dbResponse.Items.map(async user => {
                let url = null;
                let croppedUrl = null;
                if (user.originalPhotoFileId) {
                    const s3Bucket = new AWS.S3({ params: { Bucket: 'user-original-photos' } });
                    const date = new Date();
                    date.setTime(date.getTime() + 1000);
                    url = await s3Bucket.getSignedUrlPromise('getObject', {
                        Key: user.originalPhotoFileId,
                        Expires: 60 * 60
                    });
                }
                if (user.croppedPhotoFileId) {
                    const date = new Date();
                    date.setTime(date.getTime() + 1000);
                    const croppedBucket = new AWS.S3({ params: { Bucket: 'user-cropped-photos' } });
                    croppedUrl = await croppedBucket.getSignedUrlPromise('getObject', {
                        Key: user.croppedPhotoFileId,
                        Expires: 60 * 60
                    });
                }
                return {
                    ...user,
                    _presignedOriginalPhoto: url,
                    _presignedCroppedPhoto: croppedUrl
                };
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                data: users
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
