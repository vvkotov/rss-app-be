"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
// initialize configuration
dotenv_1.default.config();
const app = express_1.default();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
// define a global route handler
app.all("/*", (req, res) => {
    console.log('Request path', req.path);
    console.log('Request method', req.method);
    console.log('Request body', req.body);
    const recipient = req.path.split('/')[1];
    console.log('recipient', recipient);
    const recipientUrl = process.env[recipient];
    console.log('recipientUrl', recipientUrl);
    if (recipientUrl) {
        const axiosConfig = Object.assign({ method: req.method, url: `${recipientUrl}${req.originalUrl}` }, Object.keys(req.body || {}).length && { data: req.body });
        axios_1.default(axiosConfig)
            .then((response) => {
            console.log('response from recipient', response.data);
            res.json(response.data);
        })
            .catch((error) => {
            console.log('error from recipient:', JSON.stringify(error));
            if (error.response) {
                const { data, status } = error.response;
                res.status(status).json(data);
            }
            else {
                res.status(500).json({ error: error.message });
            }
        });
    }
    else {
        res.status(502).json({ error: 'Cannot process request' });
    }
});
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map