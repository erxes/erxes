import { debugDaily, debugRequest } from '../debuggers';
import { getConfig, sendRequest } from '../utils';
import { CallRecords, ICallRecord } from './models';

const VIDEO_CALL_STATUS = {
  ONGOING: 'ongoing',
  END: 'end',
  ALL: ['ongoing', 'end']
};

const getConfigs = async () => {
  const DAILY_API_KEY = await getConfig('DAILY_API_KEY');
  const DAILY_END_POINT = await getConfig('DAILY_END_POINT');

  return {
    DAILY_API_KEY,
    DAILY_END_POINT
  };
};

const sendDailyRequest = async (url: string, method: string, body = {}) => {
  const { DAILY_API_KEY, DAILY_END_POINT } = await getConfigs();

  return sendRequest({
    url: `${DAILY_END_POINT}${url}`,
    method,
    headerParams: {
      authorization: `Bearer ${DAILY_API_KEY}`
    },
    body
  });
};

const init = async app => {
  app.get('/videoCall/usageStatus', async (_req, res) => {
    const videoCallType = await getConfig('VIDEO_CALL_TYPE');

    switch (videoCallType) {
      case 'daily': {
        const { DAILY_API_KEY, DAILY_END_POINT } = await getConfigs();

        return res.send(Boolean(DAILY_API_KEY && DAILY_END_POINT));
      }

      default: {
        return res.send(false);
      }
    }
  });

  // delete all rooms
  app.delete('/daily/rooms', async (_req, res, next) => {
    try {
      const response = await sendDailyRequest('/api/v1/rooms', 'GET');
      const rooms = response.data || [];

      for (const room of rooms) {
        await CallRecords.updateOne(
          { roomName: room.name },
          { $set: { status: VIDEO_CALL_STATUS.END } }
        );

        await sendDailyRequest(`/api/v1/rooms/${room.name}`, 'DELETE');
      }

      return res.send('Successfully deleted all rooms');
    } catch (e) {
      return next(e);
    }
  });

  app.delete('/daily/rooms/:roomName', async (req, res, next) => {
    const { roomName } = req.params;

    try {
      const callRecord = await CallRecords.findOne({
        roomName,
        status: VIDEO_CALL_STATUS.ONGOING
      });

      if (callRecord) {
        const response = await sendDailyRequest(
          `/api/v1/rooms/${callRecord.roomName}`,
          'DELETE'
        );

        await CallRecords.updateOne(
          { _id: callRecord._id },
          { $set: { status: VIDEO_CALL_STATUS.END } }
        );

        return res.json(response.deleted);
      }

      return res.json({});
    } catch (e) {
      return next(e);
    }
  });

  app.get('/daily/room', async (req, res, next) => {
    debugRequest(debugDaily, req);

    const { DAILY_END_POINT } = await getConfigs();
    const { erxesApiMessageId } = req.query;

    try {
      const callRecord = await CallRecords.findOne({ erxesApiMessageId });

      if (callRecord) {
        const response = {
          url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${callRecord.token}`,
          status: callRecord.status
        };

        return res.json(response);
      }

      return res.json({ url: '', status: VIDEO_CALL_STATUS.END });
    } catch (e) {
      return next(e);
    }
  });

  app.get('/daily/get-active-room', async (req, res, next) => {
    debugRequest(debugDaily, req);

    const { erxesApiConversationId } = req.query;
    const { DAILY_END_POINT } = await getConfigs();

    try {
      const callRecord = await CallRecords.findOne({
        erxesApiConversationId,
        status: VIDEO_CALL_STATUS.ONGOING
      });

      if (callRecord) {
        const ownerTokenResponse = await sendDailyRequest(
          `/api/v1/meeting-tokens/`,
          'POST',
          {
            properties: { room_name: callRecord.roomName }
          }
        );

        const response = {
          url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`,
          name: callRecord.roomName
        };

        return res.json(response);
      }

      return res.json({});
    } catch (e) {
      return next(e);
    }
  });

  // create room
  app.post('/daily/room', async (req, res, next) => {
    debugRequest(debugDaily, req);

    const { DAILY_END_POINT } = await getConfigs();
    const { erxesApiMessageId, erxesApiConversationId } = req.body;

    try {
      const privacy = 'private';

      const response = await sendDailyRequest(`/api/v1/rooms`, 'POST', {
        privacy
      });

      const tokenResponse = await sendDailyRequest(
        `/api/v1/meeting-tokens/`,
        'POST',
        {
          properties: { room_name: response.name }
        }
      );

      const doc: ICallRecord = {
        erxesApiConversationId,
        erxesApiMessageId,
        roomName: response.name,
        kind: 'daily',
        privacy,
        token: tokenResponse.token
      };

      const callRecord = await CallRecords.createCallRecord(doc);

      const ownerTokenResponse = await sendDailyRequest(
        `/api/v1/meeting-tokens/`,
        'POST',
        {
          properties: { room_name: response.name, enable_recording: 'cloud' }
        }
      );

      return res.json({
        url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`,
        name: callRecord.roomName,
        status: VIDEO_CALL_STATUS.ONGOING
      });
    } catch (e) {
      return next(e);
    }
  });
};

export default init;
