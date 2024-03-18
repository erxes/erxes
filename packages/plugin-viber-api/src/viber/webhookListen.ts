import { Request, Response } from 'express';
import messageListen from './messageListen';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

const webhookListen = async (req: Request, res: Response): Promise<void> => {
  const subdomain: string = getSubdomainHeader(req);

  if (req.body.event === 'message') {
    await messageListen(req.body, req.params.integrationId, subdomain);
  }

  res.json({ status: 'success' });
};

export default webhookListen;
