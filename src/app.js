import 'dotenv/config';

import express from 'express';
import path from 'path';
import 'express-async-errors';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import cors from 'cors';
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
    constructor() {
        this.server = express();
        Sentry.init(sentryConfig);
        this.middlewares();
        this.routes();
        this.exceptionHandler();
    }

    middlewares() {
        this.server.use(Sentry.Handlers.requestHandler());
        // Define which address can access the app
        // Example: this.server.use(cors({ origin: 'https://rocketseat.com.br' }));
        // Empty to access from any address
        this.server.use(cors());
        this.server.use(express.json());
        this.server.use(
            '/files',
            express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
        );
        this.server.use(express.static(__dirname, { dotfiles: 'allow' }));
    }

    routes() {
        this.server.use(routes);
        this.server.use(Sentry.Handlers.errorHandler());
    }

    exceptionHandler() {
        this.server.use(async (err, req, res, next) => {
            if (process.env.NODE_ENV === 'development') {
                const errors = await new Youch(err, req).toJSON();

                return res.status(500).json(errors);
            }

            return res.status(500).json({ error: 'Internal server error' });
        });
    }
}

export default new App().server;
