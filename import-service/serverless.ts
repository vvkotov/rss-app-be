import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_URL: "${cf:product-service-${self:provider.stage}.SQSQueueUrl}"
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: "arn:aws:s3:::rss-app-import-service"
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: "${cf:product-service-${self:provider.stage}.SQSQueueArn}"
      }
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true
                }
              }
            },
            authorizer: {
              name: 'authorizer',
              arn: '${cf:authorization-service-${self:provider.stage}.AuthorizationArn}',
              type: 'TOKEN',
              identitySource: 'method.request.header.Authorization',
              resultTtlInSeconds: 0,
            }
          }
        }
      ]
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: 'rss-app-import-service',
            event: 's3:ObjectCreated:*',
            rules: [
              {
                prefix: 'uploaded/',
                suffix: null
              }
            ],
            existing: true
          }
        }
      ]
    }
  },
  resources: {
    Resources: {
      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'UNAUTHORIZED',
          ResponseTemplates: {
            'application/json': '{"message":"Authorization header was not provided"}',
          },
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
      GatewayResponseAuthFail: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'",
          },
          ResponseType: 'AUTHORIZER_FAILURE',
          StatusCode: 401,
          ResponseTemplates: {
            'application/json': '{"message":"Invalid token was provided"}',
          },
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      }
    }
  }
}

module.exports = serverlessConfiguration;
