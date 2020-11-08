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
    const { rows }  = await client.query('select * from products p left join stocks s on p.id = s.product_id where p.id = ($1)', [productId])
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        product: rows[0]
      })
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        err
      })
    };
  } finally {
    client.end();
  }
}
