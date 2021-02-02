import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as formidable from 'formidable';
import * as Nylas from 'nylas';
import { debugNylas, debugRequest } from '../debuggers';
import {
  createNylasIntegration,
  getMessage,
  nylasCheckCalendarAvailability,
  nylasConnectCalendars,
  nylasCreateCalenderEvent,
  nylasCreateSchedulePage,
  nylasDeleteCalendarEvent,
  nylasDeleteSchedulePage,
  nylasFileUpload,
  nylasGetAccountCalendars,
  nylasGetAttachment,
  nylasGetCalendarOrEvent,
  nylasGetEvents,
  nylasGetSchedulePage,
  nylasGetSchedulePages,
  nylasRemoveCalendars,
  nylasSendEmail,
  nylasUpdateEvent,
  nylasUpdateSchedulePage,
  updateCalendar
} from './handleController';
import loginMiddleware from './loginMiddleware';
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

    const { page, booking, deltas } = req.body;

    if (page && booking) {
      return res.status(200).send('success');
    }

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

    debugNylas(`Get message with erxesApiId: ${erxesApiMessageId}`);

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

  app.post('/nylas/connect-calendars', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { uid } = req.body;

    try {
      const response = await nylasConnectCalendars(uid);

      return res.json({
        status: 'ok',
        ...response
      });
    } catch (e) {
      return next(e);
    }
  });

  app.post('/nylas/remove-calendars', async (req, res, next) => {
    const { accountId } = req.body;

    try {
      await nylasRemoveCalendars(accountId);
    } catch (e) {
      return next(e);
    }

    return res.json({ status: 'ok' });
  });

  app.get('/nylas/get-calendars', async (req, res, next) => {
    const { accountId, show } = req.query;

    try {
      const calendars = await nylasGetAccountCalendars(accountId, show);

      return res.json(calendars);
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/get-events', async (req, res, next) => {
    const { calendarIds, startTime, endTime } = req.query;

    try {
      const events = await nylasGetEvents({ calendarIds, startTime, endTime });

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

    const { accountId, ...doc } = req.body;

    try {
      const response = await nylasCreateCalenderEvent({ accountId, doc });

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/edit-calendar-event', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { accountId, _id, ...doc } = req.body;

    try {
      const response = await nylasUpdateEvent({
        accountId,
        eventId: _id,
        doc
      });

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/edit-calendar', async (req, res, next) => {
    debugRequest(debugNylas, req);

    try {
      const response = await updateCalendar(req.body);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/delete-calendar-event', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { accountId, _id } = req.body;

    try {
      const response = await nylasDeleteCalendarEvent({
        accountId,
        eventId: _id
      });

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/get-schedule-pages', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { accountId } = req.query;

    try {
      const response = await nylasGetSchedulePages(accountId);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.get('/nylas/get-schedule-page', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { pageId } = req.query;

    try {
      const response = await nylasGetSchedulePage(pageId);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/create-schedule-page', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { accountId, ...doc } = req.body;

    try {
      const response = await nylasCreateSchedulePage(accountId, doc);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/edit-schedule-page', async (req, res, next) => {
    debugRequest(debugNylas, req);

    const { _id, ...doc } = req.body;

    try {
      const response = await nylasUpdateSchedulePage(_id, doc);

      return res.json(response);
    } catch (e) {
      next(e);
    }
  });

  app.post('/nylas/delete-page', async (req, res, next) => {
    const { pageId } = req.body;

    try {
      await nylasDeleteSchedulePage(pageId);
    } catch (e) {
      return next(e);
    }

    return res.json({ status: 'ok' });
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
