import { SQSHandler } from 'aws-lambda';
import { Client } from 'pg';

import { dbOptions } from '../constants/dbOptions';
import { Product } from '../constants/product';

export const catalogBatchProcess:SQSHandler = async (event) => {
    const client = new Client(dbOptions);

    try {
        await client.connect();
        for (let record of event.Records) {
            const { title, description, price, count }: Product = JSON.parse(record.body);
            const product: Product = {
                title,
                description,
                price: Number(price),
                count: Number(count)
            }
            await addProductToDB(client, product);
        }

    } catch(err) {
        console.log('catalogBatchProcess error', err);
    }
    console.log('catalogBatchProcess', event)
}

const addProductToDB = async(client: Client, product: Product) => {
    try {
        const { title, description, price, count } = product;
        await client.query("begin");

        const { rows } = await client.query(`
            INSERT INTO products
            (title, description, price)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [title, description, price]);

        const productId = rows[0].id;
        await client.query(`INSERT INTO stocks (product_id, count) VALUES ($1, $2)`, [productId, count]);

        await client.query("commit");
    } catch (err) {
        await client.query("rollback");
        console.log('addProductToDB error', err);
    }
};