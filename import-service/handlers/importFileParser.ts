import { S3Event, S3Handler } from 'aws-lambda';
import { S3, SQS } from 'aws-sdk';
import * as csvParser from 'csv-parser';

export const importFileParser: S3Handler = (event: S3Event) => {
    const s3 = new S3({ region: 'eu-west-1' });
    const Bucket = 'rss-app-import-service';

    const sqs = new SQS();

    event.Records.forEach(record => {
        const Key = record.s3.object.key;

        const s3Stream = s3.getObject({
            Bucket,
            Key
        }).createReadStream();

        s3Stream.pipe(csvParser({ separator: ';' }))
            .on('data', (data) => {
                console.log('csvParser data', data)
                sqs.sendMessage({
                    QueueUrl: process.env.SQS_URL,
                    MessageBody: JSON.stringify(data)
                }, (err, resp) => {
                    if (err) {
                        console.log('sendMessage err', err);
                        return;
                    }
                    console.log('sqs.sendMessage', data, resp)
                })
            })
            .on('end', async () => {
                console.log(`Copy from ${Bucket}/${Key}`);

                await s3.copyObject({
                    Bucket,
                    CopySource: `${Bucket}/${Key}`,
                    Key: Key.replace('uploaded', 'parsed')
                }).promise()

                console.log(`Copied into ${Bucket}/${Key.replace('uploaded', 'parsed')}`);

                const deleteParams = {
                    Bucket,
                    Key
                }
                await s3.deleteObject(deleteParams, (err, data) => {
                    if (err) {
                        console.log('deleteObject error', err);
                        return;
                    }
                    console.log('deleteObject data', data)
                }).promise()
            })
            .on('error', (err) => {
                console.log('csvParser error', err);
            })
    })
}