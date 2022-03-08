import { routeErrorHandling } from '../helpers';
import { getConfig, getRecordings, sendRequest } from '../utils';
import { CallRecords, ICallRecord } from './models';

export const VIDEO_CALL_STATUS = {
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

export const createDailyRoom = async ({ erxesApiMessageId, erxesApiConversationId }) => {
    const { DAILY_END_POINT } = await getConfigs();

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

    return {
      url: `${DAILY_END_POINT}/${callRecord.roomName}?t=${ownerTokenResponse.token}`,
      name: callRecord.roomName,
      status: VIDEO_CALL_STATUS.ONGOING
    };
};

export const getDailyRoom = async ({ erxesApiMessageId }) => {
  const { DAILY_END_POINT } = await getConfigs();

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

  return response;
}

export const getDailyActiveRoom = async ({ erxesApiConversationId }) => {
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

  return response;
}

const init = async app => {
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
};

export default init;
