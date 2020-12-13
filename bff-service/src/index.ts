import express, { Request, Response } from "express";
import dotenv from "dotenv";
import axios, { AxiosRequestConfig, Method } from 'axios';

import productsCache from './products-cache';

// initialize configuration
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/products', ( req, res ) => {
    console.log('/products');
    if (productsCache.hasData() && productsCache.isNotExpired()) {
        console.log('Return products from cache')
        res.json(productsCache.getData());
    } else {
        const recipientUrl = getRecipientUrl(req.path);
        const axiosConfig = getAxiosConfig(req, recipientUrl);

        makeARequest(axiosConfig, res, true);
    }
});

// define a global route handler
app.all( "/*", ( req, res ) => {
    console.log('Request path',req.path);
    console.log('Request method',req.method);
    console.log('Request body',req.body);

   const recipientUrl = getRecipientUrl(req.path);
    if (recipientUrl) {
        const axiosConfig = getAxiosConfig(req, recipientUrl);
        makeARequest(axiosConfig, res);
    } else {
        res.status(502).json({ error: 'Cannot process request'})
    }
});

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});

function getRecipientUrl(path: string): string {
    const recipient = path.split('/')[1];
    console.log('recipient', recipient);

    const recipientUrl = process.env[recipient];
    console.log('recipientUrl', recipientUrl)

    return recipientUrl;
}

function getAxiosConfig(req: Request, recipientUrl: string): AxiosRequestConfig {
    return {
        method: req.method as Method,
        url: `${recipientUrl}${req.originalUrl}`,
        ...Object.keys(req.body || {}).length && {data: req.body}
    }
}

function makeARequest(axiosConfig: AxiosRequestConfig, res: Response, saveToCache = false): void {
    axios(axiosConfig)
        .then((response) => {
            console.log('response from recipient', axiosConfig.url, response.data);
            if (saveToCache) {
                productsCache.set(response.data);
            }
            res.json(response.data);
        })
        .catch((error) => {
            console.log('error from recipient:', axiosConfig.url, JSON.stringify(error));
            if (error.response) {
                const { data, status } = error.response;
                res.status(status).json(data)
            } else {
                res.status(500).json({error: error.message})
            }
        })
}