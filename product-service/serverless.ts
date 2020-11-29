import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
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
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sns:*",
        Resource: { Ref: 'SNSTopic' }
      }
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      PG_HOST: 'rss-app-database.cva9hwr0earm.eu-west-1.rds.amazonaws.com',
      PG_PORT: 5432,
      PG_DATABASE: 'postgres',
      PG_USERNAME: 'test',
      PG_PASSWORD: 'test',
      SNS_ARN: { Ref: 'SNSTopic' }
    },
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue'
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic'
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'vkotov1@gmail.com',
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
          FilterPolicy: {
            products: ['send']
          }
        }
      },
      SNSFilterSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'v.kotov1@gmail.com',
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
          FilterPolicy: {
            products: ['skip']
          }
        }
      }
    },
    Outputs: {
      SQSQueueUrl: {
        Description : "URL of new Amazon SQS Queue",
        Value: { Ref: 'SQSQueue' }
      },
      SQSQueueArn: {
        Description : "ARN of new Amazon SQS Queue",
        Value: {'Fn::GetAtt': ['SQSQueue', 'Arn']}
      }
    }
  },
  functions: {
    getProducts: {
      handler: 'handler.getProductsList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true
          }
        }
      ]
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{productId}',
            cors: true,
            request: {
              parameters: {
                paths: {
                  productId: true
                }
              }
            } 
          }
        }
      ]
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {'Fn::GetAtt': ['SQSQueue', 'Arn']}
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
