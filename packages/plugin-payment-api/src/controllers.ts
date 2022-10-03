import * as dotenv from 'dotenv';
import { Router } from 'express';
import { renderToString } from 'react-dom/server';

import PaymentsContainer from './paymentGateway/src/containers/Payments';

dotenv.config();

const router = Router();

router.get('/gateway', async (_req, res) => {
  const html = 'gateway!!!';
  res.send(html);
});

export default router;
