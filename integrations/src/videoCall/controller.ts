import { debugDaily, debugRequest } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { getConfig, getRecordings, sendRequest } from '../utils';
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

export const sendDailyRequest = async (
  url: string,
  method: string,
  body = {}
) => {
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
  app.get(
    '/videoCall/usageStatus',
    routeErrorHandling(async (_req, res) => {
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
    })
  );

  // delete all rooms
  app.delete(
    '/daily/rooms',
    routeErrorHandling(async (_req, res) => {
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
    })
  );

  app.delete(
    '/daily/rooms/:roomName',
    routeErrorHandling(async (req, res) => {
      const { roomName } = req.params;

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
    })
  );

  app.get(
    '/daily/room',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugDaily, req);

      const { DAILY_END_POINT } = await getConfigs();
      const { erxesApiMessageId } = req.query;

      const callRecord = await CallRecords.findOne({ erxesApiMessageId });

      const response: {
        url?: string;
        status?: string;
        recordingLinks?: string[];
      } = { url: '', status: VIDEO_CALL_STATUS.END, recordingLinks: [] };

      if (callRecord) {
        response.url = `${DAILY_END_POINT}/${callRecord.roomName}?t=${callRecord.token}`;
        response.status = callRecord.status;

        const updatedRecordins = await getRecordings(
          callRecord.recordings || []
        );

        callRecord.recordings = updatedRecordins;
        await callRecord.save();

        response.recordingLinks = updatedRecordins.map(r => r.url);
      }

      return res.json(response);
    })
  );

  app.get(
    '/daily/get-active-room',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugDaily, req);

      const { erxesApiConversationId } = req.query;
      const { DAILY_END_POINT } = await getConfigs();

      const callRecord = await CallRecords.findOne({
        erxesApiConversationId,
        status: VIDEO_CALL_STATUS.ONGOING
      });

      const response: {
        url?: string;
        name?: string;
        recordingLinks?: string[];
      } = {
        recordingLinks: []
      };

      if (callRecord) {
        const ownerTokenResponse = await sendDailyRequest(
          '/api/v1/meeting-tokens/',
          'POST',
          {
            properties: { room_name: callRecord.roomName }
          }
        );

        response.url = `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`;
        response.name = callRecord.roomName;
      }

      return res.json(response);
    })
  );

  app.post(
    '/daily/saveRecordingInfo',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugDaily, req);

      const { erxesApiConversationId, recordingId } = req.body;

      await CallRecords.updateOne(
        { erxesApiConversationId, status: VIDEO_CALL_STATUS.ONGOING },
        { $push: { recordings: { id: recordingId } } }
      );

      return res.json({
        status: 'ok'
      });
    })
  );

  // create room
  app.post(
    '/daily/room',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugDaily, req);

      const { DAILY_END_POINT } = await getConfigs();
      const { erxesApiMessageId, erxesApiConversationId } = req.body;

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
    })
  );
};

export default init;
