import * as express from 'express';

const app = express();
app.disable('x-powered-by');

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

export default app;
