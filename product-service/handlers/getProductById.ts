import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import 'source-map-support/register';

import { headers } from '../constants/headers';
import { dbOptions } from '../constants/dbOptions';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  const client = new Client(dbOptions);
  await client.connect();

  console.log('Event', event);

  try {
    const { productId } = event.pathParameters;
    const { rows: product }  = await client.query(`select p.id, p.title, p.description, p.price, s.count 
      from products p 
      left join stocks s
      on p.id = s.product_id
      where p.id = ($1)`
    , [productId]);

    const statusCode = !!product ? 200 : 404;
    const bodyResult = product || { message: `Product with ${productId} is not found`};

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        bodyResult
      })
    };
  } catch(err) {
    console.log('getProductById error', err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal server error, see the logs for details"
      })
    };
  } finally {
    client.end();
  }
}
