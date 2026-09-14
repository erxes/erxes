import type { Request, Response } from 'express';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import {
  readViberStoredAttachment,
  verifyViberMediaLink,
} from '@/integrations/viber/utils/outboundMedia';

export const serveViberOutboundMedia = async (
  req: Request<{
    integrationId: string;
    messageId: string;
    index: string;
    name: string;
  }>,
  res: Response,
): Promise<void> => {
  const { integrationId, messageId, index, name } = req.params;
  const { expires, signature } = req.query;
  if (
    typeof expires !== 'string' ||
    typeof signature !== 'string' ||
    !/^\d+$/.test(expires) ||
    !/^\d+$/.test(index)
  ) {
    res.sendStatus(403);
    return;
  }
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const integration = await models.ViberIntegrations.findOne({
    inboxId: integrationId,
  }).select('+token');
  if (
    !integration ||
    !verifyViberMediaLink(
      subdomain,
      integrationId,
      integration.token,
      messageId,
      Number(index),
      name,
      Number(expires),
      signature,
    )
  ) {
    res.sendStatus(403);
    return;
  }
  const outbox = await models.ViberOutbox.findOne({
    _id: messageId,
    inboxId: integrationId,
  });
  const part = outbox?.parts[Number(index)];
  if (
    !part?.attachment ||
    part.attachment.name !== name ||
    !['sending', 'sent', 'unknown'].includes(part.state)
  ) {
    res.sendStatus(404);
    return;
  }
  const content = await readViberStoredAttachment(subdomain, part.attachment);
  const contentType =
    part.body.type === 'picture'
      ? {
          png: 'image/png',
          gif: 'image/gif',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
        }[name.split('.').pop()?.toLowerCase() ?? ''] ??
        'application/octet-stream'
      : part.body.type === 'video'
      ? 'video/mp4'
      : 'application/octet-stream';
  res.set({
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(
      name,
    )}`,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Length': String(content.length),
  });
  res.status(200).send(content);
};
