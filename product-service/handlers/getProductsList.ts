import { APIGatewayProxyHandler } from 'aws-lambda';
import { Client } from 'pg';
import 'source-map-support/register';

import { headers } from '../constants/headers';
import { dbOptions } from '../constants/dbOptions';

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  const client = new Client(dbOptions);
  await client.connect();
  
  console.log('Event', event);

  try {
    const { rows: products } = await client.query('select * from products p left join stocks s on p.id = s.product_id')
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        products
      })
    };
  } catch(err) {
    console.log('getProductsList error', err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal server error, see the logs for details"
      })
    };
  } finally {
    client.end()
  }
}
