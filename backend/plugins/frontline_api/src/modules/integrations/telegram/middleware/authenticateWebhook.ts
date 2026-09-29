import type { NextFunction, Request, Response } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export const authenticateTelegramWebhook = async (
  req: Request<{ _id: string }, unknown, unknown>,
  res: Response<unknown>,
  next: NextFunction,
): Promise<void> => {
  const { _id } = req.params;
  const receivedSecret = req.get('X-Telegram-Bot-Api-Secret-Token');

  if (!_id || !receivedSecret) {
    res.sendStatus(401);
    return;
  }

  try {
    const models = await generateModels(getSubdomain(req));
    const verified = await models.TelegramBots.verifyWebhookSecret(
      _id,
      receivedSecret,
    );

    if (!verified) {
      res.sendStatus(401);
      return;
    }
  } catch {
    res.sendStatus(500);
    return;
  }

  next();
};
