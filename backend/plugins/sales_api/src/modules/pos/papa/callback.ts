import { timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { handlePapaCallback } from './service';

const secretsMatch = (expected: string, received: string) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Papa webhook: `GET /papa-callback/:secret?object_id&object_type&object_action&reference_id`.
 * Papa gives up after 10 seconds and never retries, so the response is sent
 * before the order is refreshed.
 */
export const papaCallback = async (req: Request, res: Response) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const config = await models.PapaConfigs.getConfig();
    const secret = String(req.params.secret || '');

    if (
      !config?.callbackSecret ||
      !secretsMatch(config.callbackSecret, secret)
    ) {
      res.status(404).end();
      return;
    }

    res.status(200).end();

    await handlePapaCallback(models, req.query as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[sales] Papa callback failed: ${message}`);

    if (!res.headersSent) {
      res.status(500).end();
    }
  }
};
