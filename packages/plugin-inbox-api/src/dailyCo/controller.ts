import { CallRecords, IRecording } from '../models/definitions/callRecords';
import Configs from '../models/definitions/configs';
import { sendRequest } from '@erxes/api-utils/src/requests';

const VIDEO_CALL_STATUS = {
  ONGOING: 'ongoing',
  END: 'end',
  ALL: ['ongoing', 'end']
};

export const getEndpoint = async (): Promise<string> => {
  const config = await Configs.getConfig('DAILY_END_POINT');
  return config.value;
};

export const getAuthToken = async (): Promise<string> => {
  const config = await Configs.getConfig('DAILY_API_KEY');
  return config.value;
};

export const sendDailyRequest = async (
  url: string,
  method: string,
  body = {}
) => {
  return await sendRequest({
    headers: { authorization: `Bearer ${await getAuthToken()}` },
    url: `${await getEndpoint()}${url}`,
    method,
    body
  });
};

export const isAfter = (
  expiresTimestamp: number,
  defaultMillisecond?: number
): boolean => {
  const millisecond = defaultMillisecond || new Date().getTime();
  const expiresMillisecond = new Date(expiresTimestamp * 1000).getTime();
  return expiresMillisecond > millisecond;
};

//no usage
export const getRecordings = async (recordings: IRecording[]) => {
  const newRecordings: IRecording[] = [];
  for (const record of recordings) {
    if (!record.expires || (record.expires && !isAfter(record.expires))) {
      const accessLinkResponse = await sendDailyRequest(
        `/api/v1/recordings/${record.id}/access-link`,
        'GET'
      );
      record.expires = accessLinkResponse.expires;
      record.url = accessLinkResponse.download_link;
    }
    newRecordings.push(record);
  }
  return newRecordings;
};

export const getRoomDetail = async (roomName: string) => {
  try {
    return await sendDailyRequest(`/api/v1/rooms/${roomName}`, 'GET');
  } catch (e) {
    return null;
  }
};

//no usage
export const getRoomList = async () => {
  try {
    const response = await sendDailyRequest('/api/v1/rooms', 'GET');
    return response.data;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const createRoom = async () => {
  try {
    return await sendDailyRequest('/api/v1/rooms', 'POST', {
      privacy: 'private'
    });
  } catch (e) {
    throw new Error(e.message);
  }
};

export const deleteRoom = async (roomName: string) => {
  try {
    await sendDailyRequest(`/api/v1/rooms/${roomName}`, 'DELETE');
  } catch (e) {
    return true;
  }

  return true;
};

//no usage
export const deleteAllRoom = async () => {
  try {
    const response = await sendDailyRequest('/api/v1/rooms', 'GET');
    const rooms = response.data || [];

    for (const room of rooms) {
      await CallRecords.updateOne(
        { roomName: room.name },
        { $set: { status: VIDEO_CALL_STATUS.END } }
      );
      await sendDailyRequest(`/api/api/v1/rooms/${room.name}`, 'DELETE');
    }

    return true;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const getRoomToken = async (roomName: string, isOwner = false) => {
  const properties: any = { room_name: roomName };

  if (isOwner) {
    properties.enable_recording = 'cloud';
  }

  try {
    const response = await sendDailyRequest('/api/v1/meeting-tokens', 'POST', {
      properties
    });
    return response.token;
  } catch (e) {
    throw new Error(e.message);
  }
};
