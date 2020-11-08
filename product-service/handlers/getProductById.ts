import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

import { products } from '../mock-data/products';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  const { productId } = event.pathParameters;
  const product = products.find((product) => product.id === productId);

  const statusCode = !!product ? 200 : 404;
  const body = !!product ? product : {
    message: "product not found"
  };

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET"
    },
    body: JSON.stringify(body)
  };
}
