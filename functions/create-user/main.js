const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const dynamoOptions = { endpoint: process.env.AWS_SAM_LOCAL === 'true' ? 'http://dynamodb:8000' : null };
const dynamo = new AWS.DynamoDB.DocumentClient(dynamoOptions);

const TABLE_NAME = 'auc_users';

exports.lambdaHandler = async event => {
    try {
        const user = { ...JSON.parse(event.body), Id: uuidv4() };
        if (user.profilePhoto) {
            const base64Photo = user.profilePhoto;
            delete user.profilePhoto;

            const buf = new Buffer(base64Photo, 'base64');
            const s3Bucket = new AWS.S3({ params: { Bucket: 'user-original-photos' } });
            const Key = `${user.Id}-${new Date().getTime()}`;
            await s3Bucket
                .putObject({
                    Key,
                    Body: buf,
                    ContentEncoding: 'base64',
                    ContentType: 'image/jpeg'
                })
                .promise();
            user.originalPhotoFileId = Key;

            const croppData = {
                x: user.croppX,
                y: user.croppY,
                width: user.croppWidth,
                height: user.croppHeight,
                rotate: user.croppRotate
            };

            if (croppData.x || croppData.y || croppData.rotate) {
                const buffer = Buffer.from(base64Photo, 'base64');

                const sharp = require('sharp');
                let cropping = sharp(buffer);
                if (croppData.height && croppData.width && croppData.x && croppData.y) {
                    cropping = cropping.extract({
                        height: croppData.height || null,
                        width: croppData.width || null,
                        left: croppData.x || null,
                        top: croppData.y || null
                    });
                }
                if (croppData.rotate) {
                    cropping = cropping.rotate(croppData.rotate);
                }
                const croppedImage = await cropping.toBuffer();

                const croppedKey = `${user.Id}-${new Date().getTime()}`;
                await s3Bucket
                    .putObject({
                        Bucket: 'user-cropped-photos',
                        Key: croppedKey,
                        Body: croppedImage,
                        ContentEncoding: 'base64',
                        ContentType: 'image/jpeg'
                    })
                    .promise();

                user.croppedPhotoFileId = croppedKey;
            }
        }

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
