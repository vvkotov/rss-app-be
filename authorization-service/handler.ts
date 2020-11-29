import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';
import 'source-map-support/register';

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = (event, _context, callback) => {
  console.log('basicAuthorizer event:', JSON.stringify(event));

  if (event['type'] !== 'TOKEN') {
    callback('Unauthorized');
  }

  try {
    const authorizationToken = event.authorizationToken;
    const encodedCreds = authorizationToken.split(' ')[1];
    if (!authorizationToken || !encodedCreds) {
      callback('Invalid token was provided');
    }
    const buff = Buffer.from(encodedCreds, 'base64');
    const [username, password] = buff.toString('utf-8').split(':');

    console.log(`username: ${username} and password: ${password}`);

    const storedUserPassword = process.env[username];
    const effect = storedUserPassword && storedUserPassword === password ? 'Allow' : 'Deny';
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    callback(null, policy);

  } catch (err) {
    console.log('basicAuthorizer error:', err);
    callback(`Unauthorized: ${err.message}`);
  }
}

const generatePolicy = (principalId: string, resource, effect = 'Deny'): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  }
}
