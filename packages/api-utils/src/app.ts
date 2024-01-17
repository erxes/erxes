import * as express from 'express';

const app = express();
app.disable('x-powered-by');

export default app;