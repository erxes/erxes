import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as formidable from 'formidable';
import * as Nylas from 'nylas';
import { debugNylas, debugRequest } from '../debuggers';
import { Integrations } from '../models';
import {
  // createNylasIntegration,
  createNylasIntegration,
  getMessage,
  nylasCheckCalendarAvailability,
  nylasCreateCalenderEvent,
  nylasFileUpload,
  nylasGetAllEvents,
  nylasGetAttachment,
  nylasGetCalendarOrEvent,
  nylasGetCalendars,
  nylasSendEmail
} from './handleController';
import loginMiddleware from './loginMiddleware';
import { NylasCalendars, NylasEvent } from './models';
import {
  getNylasConfig,
  syncCalendars,
  syncEvents,
  syncMessages
} from './utils';

// load config
dotenv.config();

export const initNylas = async app => {
  app.get('/nylas/oauth2/callback', loginMiddleware);

  app.get('/nylas/webhook', (req, res) => {
    // Validation endpoint for webhook
    return res.status(200).send(req.query.challenge);
  });

  app.post('/nylas/webhook', async (req, res) => {
    // Verify the request to make sure it's from Nylas
    if (!verifyNylasSignature(req)) {
      debugNylas('Failed to verify nylas');
      return res.status(401).send('X-Nylas-Signature failed verification');
    }

    debugNylas('Received new email in nylas...');

    const deltas = req.body.deltas;

    for (const delta of deltas) {
      const data = delta.object_data || {};
      const { id, account_id } = data;

      switch (delta.type) {
        case 'message.created':
        case 'thread.replied':
          await syncMessages(account_id, id);
          break;
        case 'event.created':
        case 'event.updated':
        case 'event.deleted':
          await syncEvents(delta.type, account_id, id);
          break;
        case 'calendar.created':
        case 'calendar.updated':
        case 'calendar.deleted':
          await syncCalendars(delta.type, account_id, id);
          break;
      }
    }

    return res.status(200).send('success');
  });

  app.post('/nylas/create-integration', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { integrationId, data } = req.body;

    const args = JSON.parse(data);

    let { kind } = req.body;

    kind = kind.split('-')[1];

    try {
      await createNylasIntegration(kind, integrationId, args);
    } catch (e) {
      return next(e);
    }

    debugNylas(`Successfully created the integration and connected to nylas`);

    return res.json({ status: 'ok' });
  });

  app.get('/nylas/get-message', async (req, res, next) => {
    const { erxesApiMessageId, integrationId } = req.query;

    debugNylas('Get message with erxesApiId: ', erxesApiMessageId);

    if (!erxesApiMessageId) {
      return next('erxesApiMessageId is not provided!');
    }

    try {
      const message = await getMessage(erxesApiMessageId, integrationId);

      return res.json(message);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/upload', async (req, res) => {
    debugNylas('Uploading a file...');

    const form = new formidable.IncomingForm();

    form.parse(req, async (_error, fields, response) => {
      const { erxesApiId } = fields;

      try {
        const result = await nylasFileUpload(erxesApiId, response);
        return res.send(result);
      } catch (e) {
        return res.status(500).send(e.message);
      }
    });
  });

  app.get('/nylas/get-attachment', async (req, res, next) => {
    const { attachmentId, integrationId, filename, contentType } = req.query;

    try {
      const response = await nylasGetAttachment(attachmentId, integrationId);

      const headerOptions = { 'Content-Type': contentType };

      if (
        !['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(
          contentType
        )
      ) {
        headerOptions[
          'Content-Disposition'
        ] = `attachment;filename=${filename}`;
      }

      res.writeHead(200, headerOptions);

      return res.end(response.body, 'base64');
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/connect-calendars', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { integrationId } = req.body;

    try {
      await nylasGetCalendars(integrationId);
      await nylasGetAllEvents(integrationId);
    } catch (e) {
      return next(e);
    }

    debugNylas(`Successfully created the integration and connected to nylas`);

    return res.json({ status: 'ok' });
  });

  app.post('/nylas/remove-calendars', async (req, res, next) => {
    const { integrationId } = req.body;

    try {
      const { nylasAccountId } = await Integrations.findOne({
        erxesApiId: integrationId
      });

      const calendars = await NylasCalendars.find({
        accountUid: nylasAccountId
      }).select('providerCalendarId');

      const calendarIds = calendars.map(c => {
        return c.providerCalendarId;
      });

      await NylasCalendars.remove({ accountUid: nylasAccountId });
      await NylasEvent.remove({ providerCalendarId: { $in: calendarIds } });
    } catch (e) {
      return next(e);
    }

    return res.json({ status: 'ok' });
  });

  app.post('/nylas/send', async (req, res, next) => {
    debugRequest(debugNylas, req);
    debugNylas('Sending message...');

    const { data, erxesApiId } = req.body;
    const params = JSON.parse(data);

    try {
      await nylasSendEmail(erxesApiId, params);

      return res.json({ status: 'ok' });
    } catch (e) {
      return next(e);
    }
  });

  app.get('/nylas/get-accounts-calendars', async (req, _, next) => {
    try {
      let { kind } = req.query;

      if (kind.includes('nylas')) {
        kind = kind.split('-')[1];
      }

      const integrations = await Integrations.find({ kind });

      if (!integrations) {
        throw new Error('Integratoin not found');
      }

      const uids = integrations.map(integration => integration.nylasAccountId);

      await NylasCalendars.find({
        accountUid: { $in: uids }
      });
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/get-calendars', async (req, res, next) => {
    const { erxesApiId } = req.query;

    try {
      const nylasIntegration = await Integrations.findOne({ erxesApiId });

      if (!nylasIntegration) {
        throw new Error('Integration not found');
      }

      const accountUid = nylasIntegration.nylasAccountId;

      debugNylas(`Get calendars with accountUid: $${accountUid}`);

      const calendars = await NylasCalendars.find({ accountUid });

      if (!calendars) {
        throw new Error('Calendars not found');
      }

      return res.json(calendars);
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/get-events', async (req, res, next) => {
    const { calendarIds, startTime, endTime } = req.query;

    const getTime = (date: string) => {
      return new Date(date).getTime() / 1000;
    };

    try {
      debugNylas(`Get events with calendarIds: ${calendarIds}`);

      const events = await NylasEvent.find({
        providerCalendarId: { $in: calendarIds && calendarIds.split(',') },
        $and: [
          { 'when.start_time': { $gte: getTime(startTime) } },
          { 'when.end_time': { $lte: getTime(endTime) } }
        ]
      });

      if (!events) {
        throw new Error('Events not found');
      }

      return res.json(events);
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/get-calendar-event', async (req, res, next) => {
    const { id, type, erxesApiId } = req.query;

    try {
      const response = await nylasGetCalendarOrEvent(id, type, erxesApiId);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/check-calendar-availability', async (req, res, next) => {
    const { erxesApiId, dates } = req.query;

    try {
      const response = await nylasCheckCalendarAvailability(erxesApiId, dates);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/create-calendar-event', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { erxesApiId, ...doc } = req.body;

    try {
      const response = await nylasCreateCalenderEvent({ erxesApiId, doc });

      const {
        title,
        location,
        description,
        busy,
        participants,
        when,
        id,
        object,
        owner,
        status
      } = response;

      await NylasEvent.create({
        title,
        location,
        description,
        busy,
        participants,
        when,
        providerEventId: id,
        object,
        owner,
        status,
        providerCalendarId: doc.calendarId
      });

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });
};

/**
 * Verify request by nylas signature
 * @param {Request} req
 * @returns {Boolean} verified request state
 */
const verifyNylasSignature = async req => {
  const { NYLAS_CLIENT_SECRET } = await getNylasConfig();

  if (!NYLAS_CLIENT_SECRET) {
    debugNylas('Nylas client secret not configured');
    return;
  }

  const hmac = crypto.createHmac('sha256', NYLAS_CLIENT_SECRET);
  const digest = hmac.update(req.rawBody).digest('hex');

  return digest === req.get('x-nylas-signature');
};

/**
 * Setup the Nylas API
 * @returns void
 */
export const setupNylas = async () => {
  const { NYLAS_CLIENT_SECRET, NYLAS_CLIENT_ID } = await getNylasConfig();

  if (!NYLAS_CLIENT_ID || !NYLAS_CLIENT_SECRET) {
    debugNylas(`
      Missing following config
      NYLAS_CLIENT_ID: ${NYLAS_CLIENT_ID}
      NYLAS_CLIENT_SECRET: ${NYLAS_CLIENT_SECRET}
    `);

    return;
  }

  Nylas.config({
    clientId: NYLAS_CLIENT_ID,
    clientSecret: NYLAS_CLIENT_SECRET
  });
};
