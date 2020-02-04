import { debugDaily, debugRequest } from '../debuggers';
import { sendRequest } from '../utils';
import { CallRecords, ICallRecord } from './models';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_END_POINT = process.env.DAILY_END_POINT;

const sendDailyRequest = async (url: string, method: string, body = {}) => {
  return sendRequest({
    url: `${DAILY_END_POINT}${url}`,
    method,
    headerParams: {
      authorization: `Bearer ${DAILY_API_KEY}`,
    },
    body,
  });
};

const init = async app => {
  app.delete('/daily/rooms/:roomName', async (req, res, next) => {
    const { roomName } = req.params;

    if (DAILY_API_KEY && DAILY_END_POINT) {
      try {
        const callRecord = await CallRecords.findOne({ roomName, status: 'ongoing' });

        if (callRecord) {
          const response = await sendDailyRequest(`/api/v1/rooms/${callRecord.roomName}`, 'DELETE');

          await CallRecords.updateOne({ _id: callRecord._id }, { $set: { status: 'end' } });

          return res.json(response.deleted);
        }

        return res.json({});
      } catch (e) {
        return next(e);
      }
    }

    return next(new Error('Please configure DailyAPI'));
  });

  app.get('/daily/room', async (req, res, next) => {
    debugRequest(debugDaily, req);

    const { erxesApiMessageId } = req.query;

    if (DAILY_API_KEY && DAILY_END_POINT) {
      try {
        const callRecord = await CallRecords.findOne({ erxesApiMessageId });

        if (callRecord) {
          const response = {
            url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${callRecord.token}`,
            status: callRecord.status,
          };

          return res.json(response);
        }

        return { url: '', status: 'end' };
      } catch (e) {
        return next(e);
      }
    }

    return next(new Error('Please configure DailyAPI'));
  });

  app.get('/daily/get-active-room', async (req, res, next) => {
    debugRequest(debugDaily, req);

    const { erxesApiConversationId } = req.query;

    if (DAILY_API_KEY && DAILY_END_POINT) {
      try {
        const callRecord = await CallRecords.findOne({ erxesApiConversationId, status: 'ongoing' });

        if (callRecord) {
          const ownerTokenResponse = await sendDailyRequest(`/api/v1/meeting-tokens/`, 'POST', {
            properties: { room_name: callRecord.roomName },
          });

          const response = {
            url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`,
            name: callRecord.roomName,
          };

          return res.json(response);
        }

        return res.json({});
      } catch (e) {
        return next(e);
      }
    }

    return next(new Error('Please configure DailyAPI'));
  });

  // create room
  app.post('/daily/room', async (req, res, next) => {
    debugRequest(debugDaily, req);

    const { erxesApiMessageId, erxesApiConversationId } = req.body;

    if (DAILY_API_KEY && DAILY_END_POINT) {
      try {
        const privacy = 'private';

        const response = await sendDailyRequest(`/api/v1/rooms`, 'POST', { privacy });

        const tokenResponse = await sendDailyRequest(`/api/v1/meeting-tokens/`, 'POST', {
          properties: { room_name: response.name },
        });

        const doc: ICallRecord = {
          erxesApiConversationId,
          erxesApiMessageId,
          roomName: response.name,
          kind: 'daily',
          privacy,
          token: tokenResponse.token,
        };

        const callRecord = await CallRecords.createCallRecord(doc);

        const ownerTokenResponse = await sendDailyRequest(`/api/v1/meeting-tokens/`, 'POST', {
          properties: { room_name: response.name },
        });

        return res.json({
          url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`,
          name: callRecord.roomName,
        });
      } catch (e) {
        return next(e);
      }
    }

    return next(new Error('Please configure DailyAPI'));
  });
};

export default init;
