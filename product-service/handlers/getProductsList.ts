import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

import { products } from '../mock-data/products';

export const getProductsList: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    body: JSON.stringify({
      products
    })
  };
}
