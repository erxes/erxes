import type { Response } from 'express';
import type { IViberWebhookRequest } from '@/integrations/viber/@types/webhook';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { verifyViberSignature } from '@/integrations/viber/utils/signature';
import {
  isViberMessageToken,
  parseViberWebhookBody,
} from '@/integrations/viber/utils/webhook';
import { processViberMessage } from '@/integrations/viber/helpers';
import { MAX_VIBER_FILE_BYTES } from '@/integrations/viber/constants';

const SUPPORTED_VIBER_MESSAGE_TYPES = [
  'text',
  'picture',
  'url',
  'video',
  'file',
  'location',
  'contact',
  'sticker',
];

export const receiveViberMessage = async (
  req: IViberWebhookRequest,
  res: Response<unknown>,
): Promise<void> => {
  const { rawBody } = req;

  if (!Buffer.isBuffer(rawBody)) {
    res.status(400).json({ error: 'Invalid viber request body' });
    return;
  }

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const integration = await models.ViberIntegrations.findOne({
    inboxId: req.params.integrationId,
  }).select('+token');

  if (!integration) {
    res.status(404).json({ error: 'Viber integration not found' });
    return;
  }

  const signature = req.header('X-Viber-Content-Signature');

  const isValidSignature = verifyViberSignature(
    integration.token,
    rawBody,
    signature,
  );

  if (!isValidSignature) {
    res.status(401).json({ error: 'Invalid Viber signature' });
    return;
  }

  let payload: unknown;

  try {
    payload = parseViberWebhookBody(rawBody);
  } catch {
    res.status(400).json({ error: 'Invalid Viber webhook payload' });
    return;
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    Array.isArray(payload) ||
    !('event' in payload) ||
    typeof payload.event !== 'string' ||
    payload.event.trim() === ''
  ) {
    res.status(400).json({ error: 'Invalid Viber webhook payload' });
    return;
  }

  if (payload.event === 'webhook') {
    res.sendStatus(200);
    return;
  }

  if (payload.event === 'message') {
    if (
      !('message_token' in payload) ||
      !isViberMessageToken(payload.message_token)
    ) {
      res.status(400).json({ error: 'Invalid Viber message token' });
      return;
    }

    if (
      !('sender' in payload) ||
      typeof payload.sender !== 'object' ||
      payload.sender === null ||
      Array.isArray(payload.sender) ||
      !('id' in payload.sender) ||
      typeof payload.sender.id !== 'string' ||
      payload.sender.id.trim() === ''
    ) {
      res.status(400).json({ error: 'Invalid Viber message sender' });
      return;
    }

    if ('name' in payload.sender && typeof payload.sender.name !== 'string') {
      res.status(400).json({ error: 'Invalid Viber sender name' });
      return;
    }

    if (
      !('message' in payload) ||
      typeof payload.message !== 'object' ||
      payload.message === null ||
      Array.isArray(payload.message) ||
      !('type' in payload.message) ||
      typeof payload.message.type !== 'string' ||
      payload.message.type.trim() === ''
    ) {
      res.status(400).json({ error: 'Invalid Viber message payload' });
      return;
    }

    if (!SUPPORTED_VIBER_MESSAGE_TYPES.includes(payload.message.type)) {
      res.status(400).json({ error: 'Unsupported Viber message type' });
      return;
    }

    if (payload.message.type === 'text') {
      if (
        !('text' in payload.message) ||
        typeof payload.message.text !== 'string' ||
        payload.message.text.trim() === ''
      ) {
        res.status(400).json({ error: 'Invalid Viber text message' });
        return;
      }

      const name =
        'name' in payload.sender && typeof payload.sender.name === 'string'
          ? payload.sender.name
          : undefined;

      try {
        await processViberMessage(subdomain, {
          inboxId: req.params.integrationId,
          userId: payload.sender.id,
          messageToken: payload.message_token,
          text: payload.message.text,
          name,
        });
      } catch {
        res.status(500).json({ error: 'Failed to process Viber message' });
        return;
      }

      res.sendStatus(200);
      return;
    }

    if (
      payload.message.type === 'picture' ||
      payload.message.type === 'video' ||
      payload.message.type === 'url' ||
      payload.message.type === 'file'
    ) {
      if (
        !('media' in payload.message) ||
        typeof payload.message.media !== 'string' ||
        payload.message.media.trim() === ''
      ) {
        res.status(400).json({ error: 'Invalid Viber media message' });
        return;
      }

      let mediaUrl: URL;

      try {
        mediaUrl = new URL(payload.message.media);
      } catch {
        res.status(400).json({ error: 'Invalid Viber media URL' });
        return;
      }

      if (mediaUrl.protocol !== 'https:' && mediaUrl.protocol !== 'http:') {
        res.status(400).json({ error: 'Unsupported media URL protocol' });
        return;
      }
    }

    if (payload.message.type === 'file') {
      if (
        !('file_size' in payload.message) ||
        typeof payload.message.file_size !== 'number' ||
        !Number.isSafeInteger(payload.message.file_size) ||
        payload.message.file_size < 0 ||
        payload.message.file_size > MAX_VIBER_FILE_BYTES
      ) {
        res.status(400).json({ error: 'Invalid Viber file size' });
        return;
      }

      if (
        !('file_name' in payload.message) ||
        typeof payload.message.file_name !== 'string' ||
        payload.message.file_name.trim() === ''
      ) {
        res.status(400).json({ error: 'Invalid Viber file name' });
        return;
      }
    }

    if (payload.message.type === 'location') {
      if (
        !('location' in payload.message) ||
        typeof payload.message.location !== 'object' ||
        payload.message.location === null ||
        Array.isArray(payload.message.location)
      ) {
        res.status(400).json({ error: 'Invalid Viber location message' });
        return;
      }

      const location = payload.message.location;
      if (
        !('lat' in location) ||
        typeof location.lat !== 'number' ||
        !Number.isFinite(location.lat) ||
        location.lat < -90 ||
        location.lat > 90
      ) {
        res.status(400).json({ error: 'Invalid Viber location coordinates' });
        return;
      }

      if (
        !('lon' in location) ||
        typeof location.lon !== 'number' ||
        !Number.isFinite(location.lon) ||
        location.lon < -180 ||
        location.lon > 180
      ) {
        res.status(400).json({ error: 'Invalid Viber location coordinates' });
        return;
      }
    }

    if (payload.message.type === 'contact') {
      if (
        !('contact' in payload.message) ||
        typeof payload.message.contact !== 'object' ||
        payload.message.contact === null ||
        Array.isArray(payload.message.contact)
      ) {
        res.status(400).json({ error: 'Invalid Viber contact message' });
        return;
      }

      const contact = payload.message.contact;

      if (
        !('phone_number' in contact) ||
        typeof contact.phone_number !== 'string' ||
        contact.phone_number.trim() === ''
      ) {
        res.status(400).json({ error: 'Invalid Viber contact phone number' });
        return;
      }
      if ('name' in contact) {
        if (typeof contact.name !== 'string' || contact.name.length > 128) {
          res.status(400).json({ error: 'Invalid Viber contact name' });
          return;
        }
      }
    }

    if (payload.message.type === 'sticker') {
      if (
        !('sticker_id' in payload.message) ||
        typeof payload.message.sticker_id !== 'number' ||
        !Number.isSafeInteger(payload.message.sticker_id)
      ) {
        res.status(400).json({ error: 'Invalid Viber sticker message' });
        return;
      }
    }
  }
};
