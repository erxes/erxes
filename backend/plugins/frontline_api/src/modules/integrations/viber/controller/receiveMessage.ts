import type { Response } from 'express';
import type { IViberWebhookRequest } from '@/integrations/viber/@types/webhook';
import { getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { verifyViberSignature } from '@/integrations/viber/utils/signature';
import {
  isViberMessageToken,
  parseViberWebhookBody,
} from '@/integrations/viber/utils/webhook';
import {
  processViberMessage,
  type IViberMediaInput,
} from '@/integrations/viber/helpers';
import { resolveViberMediaSettings } from '@/integrations/viber/settings';
import { VIBER_INCOMING_MEDIA_MAX_BYTES } from '@/integrations/viber/constants';
import {
  parseViberLifecycleEvent,
  processViberLifecycleEvent,
  updateViberSubscription,
} from '@/integrations/viber/events';

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
    const inboxIntegration = await models.Integrations.findOne({
      _id: integration.inboxId,
    });
    if (!inboxIntegration) {
      res.status(404).json({ error: 'Viber inbox integration not found' });
      return;
    }
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

    let text: string | undefined;
    let media: Omit<IViberMediaInput, 'allowedHostnames'> | undefined;

    if (payload.message.type === 'text') {
      if (
        !('text' in payload.message) ||
        typeof payload.message.text !== 'string' ||
        payload.message.text.trim() === ''
      ) {
        res.status(400).json({ error: 'Invalid Viber text message' });
        return;
      }

      text = payload.message.text;
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

      if (payload.message.type === 'url') {
        text = payload.message.media;
      } else {
        if (
          'text' in payload.message &&
          typeof payload.message.text !== 'string'
        ) {
          res.status(400).json({ error: 'Invalid Viber media caption' });
          return;
        }

        text =
          'text' in payload.message && typeof payload.message.text === 'string'
            ? payload.message.text
            : '';

        media = {
          source: payload.message.media,
          messageType: payload.message.type,
          fileName: `viber-${payload.message.type}`,
        };
      }
    }

    if (payload.message.type === 'file') {
      if (
        !('file_size' in payload.message) ||
        typeof payload.message.file_size !== 'number' ||
        !Number.isSafeInteger(payload.message.file_size) ||
        payload.message.file_size < 0 ||
        payload.message.file_size > VIBER_INCOMING_MEDIA_MAX_BYTES.file
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
      if (media) {
        media.fileName = payload.message.file_name;
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
      text = `Location\nLatitude: ${location.lat}\nLongitude: ${location.lon}`;
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
      const contactName =
        'name' in contact && typeof contact.name === 'string'
          ? contact.name
          : '';

      const contactLabel = contactName.trim()
        ? `Contact: ${contactName}`
        : 'Contact';

      text = `${contactLabel}\nPhone: ${contact.phone_number}`;
    }

    if (payload.message.type === 'sticker') {
      if (
        !('sticker_id' in payload.message) ||
        !(
          (typeof payload.message.sticker_id === 'number' &&
            Number.isSafeInteger(payload.message.sticker_id) &&
            payload.message.sticker_id >= 0) ||
          (typeof payload.message.sticker_id === 'string' &&
            /^\d{1,20}$/.test(payload.message.sticker_id))
        )
      ) {
        res.status(400).json({ error: 'Invalid Viber sticker message' });
        return;
      }
      text = `Viber sticker: ${payload.message.sticker_id}`;
    }
    if (text !== undefined) {
      const name =
        'name' in payload.sender && typeof payload.sender.name === 'string'
          ? payload.sender.name
          : undefined;

      try {
        if ('timestamp' in payload) {
          if (
            typeof payload.timestamp !== 'number' ||
            !Number.isSafeInteger(payload.timestamp) ||
            payload.timestamp < 0
          ) {
            res.status(400).json({ error: 'Invalid Viber message timestamp' });
            return;
          }
          await updateViberSubscription(models, {
            inboxId: req.params.integrationId,
            userId: payload.sender.id,
            subscribed: true,
            timestamp: payload.timestamp,
          });
        }
        await processViberMessage(subdomain, {
          inboxId: req.params.integrationId,
          userId: payload.sender.id,
          messageToken: payload.message_token,
          text,
          name,
          ...(media
            ? {
                media: {
                  ...media,
                  allowedHostnames: (
                    await resolveViberMediaSettings(models, subdomain)
                  ).hostnames,
                },
              }
            : {}),
        });
      } catch {
        res.status(500).json({ error: 'Failed to process Viber message' });
        return;
      }

      res.sendStatus(200);
      return;
    }
    res.status(400).json({ error: 'Unsupported Viber message type' });
    return;
  }
  let event: ReturnType<typeof parseViberLifecycleEvent>;
  try {
    event = parseViberLifecycleEvent(payload);
  } catch {
    res.status(400).json({ error: 'Invalid Viber lifecycle event' });
    return;
  }
  try {
    if (event)
      await processViberLifecycleEvent(
        models,
        subdomain,
        req.params.integrationId,
        event,
      );
  } catch {
    res.status(500).json({ error: 'Failed to process Viber event' });
    return;
  }
  // Acknowledge future signed event types without inventing side effects.
  res.sendStatus(200);
};
