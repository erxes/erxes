import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import redis from '@erxes/api-utils/src/redis';
import { getEnv } from '@erxes/api-utils/src/core';
import * as FormData from 'form-data';
import * as moment from 'moment';
import type { RequestInit, HeadersInit } from 'node-fetch';

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || 'secret';
const CALL_API_EXPIRY = 10 * 60; // 10 minutes
const MAX_RETRY_COUNT = 3;

export const generateToken = async (integrationId, username?, password?) => {
  const payload = { integrationId, username, password };
  return jwt.sign(payload, JWT_TOKEN_SECRET);
};

const sendRequest = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Error in sendRequest:', error);
    throw error;
  }
};

const getCallHistory = async (models, _id) => {
  const history = await models.CallHistory.findOne({ _id });
  if (!history) throw new Error('Call history not found');
  return history;
};

export const sendToGrandStream = async (models, args, user) => {
  const {
    method,
    path,
    params,
    data,
    headers = {},
    integrationId,
    retryCount,
    isConvertToJson,
    isAddExtention,
    isGetExtension,
  } = args;

  if (retryCount <= 0)
    throw new Error('Retry limit exceeded. Unable to fetch record URL.');

  const integration = await models.Integrations.findOne({
    inboxId: integrationId,
  }).lean();
  if (!integration) throw new Error('Integration not found');

  const { wsServer = '' } = integration;
  const operator = integration.operators.find((op) => op.userId === user?._id);
  const extentionNumber = operator?.gsUsername || '1001';

  let cookie = await getOrSetCallCookie(wsServer);
  cookie = cookie?.toString();

  const requestOptions: RequestInit & { headers: HeadersInit } = {
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      request: {
        ...data.request,
        cookie,
        ...(isAddExtention && { extension: extentionNumber }),
      },
    }),
  };

  try {
    const res = await sendRequest(
      `https://${wsServer}/${path}`,
      requestOptions,
    );

    if (isConvertToJson) {
      const response = await res.json();

      if (response.status === -6) {
        await redis.del('callCookie');
        return (await sendToGrandStream(
          models,
          {
            path: 'api',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data,
            integrationId,
            retryCount: retryCount - 1,
            isConvertToJson,
            isGetExtension,
          },
          user,
        )) as any;
      }
      if (isGetExtension) {
        return { response, extentionNumber };
      }
      return response;
    }
    if (isGetExtension) {
      return { res, extentionNumber };
    }

    return res;
  } catch (error) {
    console.error('Error in sendToGrandStream:', error);
    throw error;
  }
};

const getOrSetCallCookie = async (wsServer) => {
  const { CALL_API_USER, CALL_API_PASSWORD } = process.env;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  if (!CALL_API_USER || !CALL_API_PASSWORD) {
    throw new Error('Required API credentials missing!');
  }

  let callCookie = await redis.get('callCookie');
  if (callCookie) {
    return callCookie;
  }

  try {
    const challengeResponse = await sendRequest(`https://${wsServer}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: { action: 'challenge', user: CALL_API_USER, version: '1.2' },
      }),
    });

    const data = await challengeResponse.json();

    const { challenge } = data?.response;
    const hashedPassword = crypto
      .createHash('md5')
      .update(challenge + CALL_API_PASSWORD)
      .digest('hex');

    const loginResponse = await sendRequest(`https://${wsServer}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          action: 'login',
          user: CALL_API_USER,
          token: hashedPassword,
        },
      }),
    });

    const loginData = await loginResponse.json();
    const { cookie } = loginData.response;

    await redis.set('callCookie', cookie, 'EX', CALL_API_EXPIRY);

    return cookie;
  } catch (error) {
    console.error('Error in getOrSetCallCookie:', error);
    throw error;
  }
};

export const getRecordUrl = async (params, user, models, subdomain) => {
  const {
    operatorPhone,
    customerPhone,
    callType,
    callStartTime,
    callEndTime,
    _id,
    transferedCallStatus,
  } = params;

  if (transferedCallStatus === 'local' && callType === 'incoming') {
    return 'Check transferred call record URL!';
  }

  const history = await getCallHistory(models, _id);
  const { inboxIntegrationId = '' } = history;

  let operator = operatorPhone || history.operatorPhone;
  const fetchRecordUrl = async (retryCount) => {
    try {
      const { response, extentionNumber } = await sendToGrandStream(
        models,
        {
          path: 'api',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            request: {
              action: 'listQueue',
              options: 'extension,queue_name,members',
              sidx: 'extension',
              sord: 'asc',
            },
          },
          integrationId: inboxIntegrationId,
          retryCount,
          isConvertToJson: true,
          isGetExtension: true,
        },
        user,
      );

      const queue = response?.response?.queue || response?.queue;

      if (!queue) {
        throw new Error('Queue not found');
      }

      const extension = queue.find((queueItem) =>
        queueItem.members.split(',').includes(extentionNumber),
      )?.extension;

      const startDate = moment(callStartTime).format('YYYY-MM-DD');
      const endDate = moment(callEndTime).format('YYYY-MM-DD');
      let caller = customerPhone;
      let callee = extentionNumber || extension || operator;
      console.log(
        extentionNumber,
        extension,
        operator,
        'operator:',
        transferedCallStatus,
        callType,
      );
      if (transferedCallStatus === 'remote') {
        callee = extentionNumber || extension;
      }

      let fileDir = 'monitor';
      if (callType === 'outgoing') {
        caller = extentionNumber;
        callee = customerPhone;
      }

      console.log('callee:', callee, caller, startDate, endDate, callType);
      const cdrData = await sendToGrandStream(
        models,
        {
          path: 'api',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            request: {
              action: 'cdrapi',
              format: 'json',
              caller,
              callee,
              numRecords: '100',
              startTime: `${startDate}T00:00:00`,
              endTime: `${endDate}T23:59:59`,
            },
          },
          integrationId: inboxIntegrationId,
          retryCount,
          isConvertToJson: true,
          isGetExtension: false,
        },
        user,
      );

      let cdrRoot = cdrData.response?.cdr_root || cdrData.cdr_root;
      if (!cdrRoot) throw new Error('CDR root not found');

      const sortedCdr = cdrRoot.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      let lastCreatedObject = sortedCdr[sortedCdr.length - 1];
      if (!lastCreatedObject) {
        throw new Error('Not found cdr');
      }

      const transferCall = findTransferCall(lastCreatedObject);

      if (transferCall) {
        lastCreatedObject = transferCall;
        fileDir = 'monitor';
      }
      if (lastCreatedObject?.disposition !== 'ANSWERED' && !transferCall) {
        throw new Error('Last created object disposition is not ANSWERED');
      }

      if (
        ['QUEUE', 'TRANSFERED'].some((substring) =>
          lastCreatedObject?.action_type?.includes(substring),
        ) &&
        !(transferedCallStatus === 'remote' && callType === 'incoming')
      ) {
        fileDir = 'queue';
      }
      const recordfiles = lastCreatedObject?.recordfiles;
      if (!recordfiles) throw new Error('Record files not found');

      const parts = recordfiles.split('/');
      const fileNameWithoutExtension = parts[1].split('@')[0];
      console.log(fileNameWithoutExtension, 'fileNameWithoutExtension');
      const records = await sendToGrandStream(
        models,
        {
          path: 'api',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          data: {
            request: {
              action: 'recapi',
              filedir: fileDir,
              filename: fileNameWithoutExtension,
            },
          },
          integrationId: inboxIntegrationId,
          retryCount,
          isConvertToJson: false,
        },
        user,
      );

      const buffer = await records.arrayBuffer();
      const domain = getEnv({
        name: 'DOMAIN',
        subdomain,
        defaultValue: 'http://localhost:4000',
      });
      const uploadUrl = domain.includes('localhost')
        ? `${domain}/pl:core/upload-file`
        : `${domain}/gateway/pl:core/upload-file`;

      const formData = new FormData();
      formData.append('file', Buffer.from(buffer), {
        filename: fileNameWithoutExtension,
      });

      const rec = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const ret = await rec.text();
      return ret;
    } catch (error) {
      console.error('Error in fetchRecordUrl:', error);
      if (retryCount > 1) {
        return fetchRecordUrl(retryCount - 1);
      }
      throw error;
    }
  };

  return fetchRecordUrl(MAX_RETRY_COUNT);
};

function findTransferCall(data: any): any {
  if (!data) {
    return null;
  }
  const transferredCalls = Object.values(data).filter((subCdr) => {
    const typedSubCdr = subCdr as any;
    return typedSubCdr.action_type === 'TRANSFER' && typedSubCdr.recordfiles;
  });

  if (transferredCalls.length === 1) {
    return transferredCalls[0]; // Return single object if only one match is found
  } else if (transferredCalls.length > 1) {
    return transferredCalls;
  }
  if (Array.isArray(data) && data.find) {
    return data.find((item) => item.action_type === 'TRANSFER');
  } else {
    return null;
  }
}
