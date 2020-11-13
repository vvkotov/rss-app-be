import { S3 } from 'aws-sdk';
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
    const s3 = new S3({ region: 'eu-west-1' });
    const catalogName = event.queryStringParameters.name;
    const catalogPath = `uploaded/${catalogName}`;
    const Bucket = 'rss-app-import-service';

    const params = {
        Bucket,
        Key: catalogPath,
        Expires: 60,
        ContentType: 'text/csv'
    }

    return new Promise<APIGatewayProxyResult>((resolve, reject) => {
        s3.getSignedUrl('putObject', params, (err, url) => {
            if (err) {
                console.log('getSignedUrl', err);
                return reject('Internal server error')
            }

            resolve({
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: url
            });
        })
    })
}
