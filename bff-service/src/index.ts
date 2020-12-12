import express from "express";
import dotenv from "dotenv";
import axios, { AxiosRequestConfig, Method } from 'axios';

// initialize configuration
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// define a global route handler
app.all( "/*", ( req, res ) => {
    console.log('Request path',req.path);
    console.log('Request method',req.method);
    console.log('Request body',req.body);

    const recipient = req.path.split('/')[1];
    console.log('recipient', recipient);

    const recipientUrl = process.env[recipient];
    console.log('recipientUrl', recipientUrl)

    if (recipientUrl) {
        const axiosConfig: AxiosRequestConfig = {
            method: req.method as Method,
            url: `${recipientUrl}${req.originalUrl}`,
            ...Object.keys(req.body || {}).length && {data: req.body}
        }

        axios(axiosConfig)
            .then((response) => {
                console.log('response from recipient', response.data);
                res.json(response.data)
            })
            .catch((error) => {
                console.log('error from recipient:', JSON.stringify(error));
                if (error.response) {
                    const { data, status } = error.response;
                    res.status(status).json(data)
                } else {
                    res.status(500).json({error: error.message})
                }
            })
    } else {
        res.status(502).json({ error: 'Cannot process request'})
    }

});

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});