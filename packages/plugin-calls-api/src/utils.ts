import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import redis from '@erxes/api-utils/src/redis';
import { getEnv } from '@erxes/api-utils/src/core';
import * as FormData from 'form-data';
import * as moment from 'moment';
import type { RequestInit, HeadersInit } from 'node-fetch';

export const generateToken = async (integrationId, username?, password?) => {
  const secret = process.env.JWT_TOKEN_SECRET || 'secret';

  const token = jwt.sign({ integrationId, username, password }, secret);
  return token;
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
    return 'Check transfered call record url!';
  }
  const history = await models.CallHistory.findOne({ _id });
  const { inboxIntegrationId = '' } = history;

  let operator = operatorPhone;
  if (!operatorPhone) {
    operator = history.operatorPhone;
  }
  try {
    const { response, extentionNumber } = (await sendToGrandStreamRequest(
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
        retryCount: 3,
        isConvertToJson: true,
        isGetExtension: true,
      },
      user,
    )) as any;

    let queue;
    if (response && response.response) {
      queue = response.response.queue;
    } else if (response && response.queue) {
      queue = response?.queue;
    }

    if (!queue) {
      throw new Error(`Queue not found`);
    }
    console.log('1');
    const extension = queue?.find(
      (queue) =>
        queue.members && queue.members.split(',').includes(extentionNumber),
    )?.extension;

    const startDate = moment(callStartTime).format('YYYY-MM-DD');
    const endTime = moment(callEndTime).format('YYYY-MM-DD');
    let caller = customerPhone;
    let callee = extentionNumber || extension || operator;

    if (transferedCallStatus === 'remote') {
      callee = extension || extentionNumber;
    }
    let fileDir = 'monitor';

    if (callType === 'outgoing') {
      caller = extentionNumber;
      callee = customerPhone;
    }

    console.log('caller: ', caller, callee, startDate, endTime, callType);
    console.log('now:', new Date());

    const cdrData = (await sendToGrandStreamRequest(
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
            endTime: `${endTime}T23:59:59`,
          },
        },
        integrationId: inboxIntegrationId,
        retryCount: 3,
        isConvertToJson: true,
      },
      user,
    )) as any;

    let cdr_root = '';

    if (cdrData && cdrData.response) {
      cdr_root = cdrData.response.cdr_root;
    } else if (cdrData && cdrData.cdr_root) {
      cdr_root = cdrData?.cdr_root;
    }
    console.log('2');

    const todayCdr = cdr_root && JSON.parse(JSON.stringify(cdr_root));
    const sortedCdr =
      todayCdr &&
      todayCdr.sort((a, b) => a.createdAt?.getTime() - b.createdAt?.getTime());

    let lastCreatedObject = sortedCdr[todayCdr.length - 1];

    let fileNameWithoutExtension = '';
    console.log('3');

    const transferCall = findTransferCall(lastCreatedObject);
    console.log(transferCall, 'transferCall');
    if (transferCall) {
      lastCreatedObject = transferCall;
      fileDir = 'monitor';
    }
    if (lastCreatedObject && lastCreatedObject.disposition === 'ANSWERED') {
      if (
        ['QUEUE', 'TRANSFERED'].some((substring) =>
          lastCreatedObject.action_type.includes(substring),
        ) &&
        !(transferedCallStatus === 'remote' && callType === 'incoming')
      ) {
        fileDir = 'queue';
      }
      const { recordfiles = '' } = lastCreatedObject;
      console.log(recordfiles, 'recordfiles', fileDir);
      if (recordfiles) {
        const parts = recordfiles.split('/');
        const fileName = parts[1];
        fileNameWithoutExtension = fileName.split('@')[0];
        console.log('4');
      }
    }
    console.log('5');

    if (fileNameWithoutExtension) {
      console.log('6');

      const records = (await sendToGrandStreamRequest(
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
          retryCount: 3,
          isConvertToJson: false,
        },
        user,
      )) as any;

      if (!records.ok) {
        throw new Error(`HTTP error! status: ${records.status}`);
      }
      console.log('7');

      try {
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
        console.log('8');

        return await rec.text();
      } catch (error) {
        console.log('9');

        console.error('Failed to retrieve array buffer from records:', error);
        throw new Error(error);
      }
    }
  } catch (e) {
    console.log(e, 'e');
    return '';
  }
  console.log('return null');
  return '';
};

export const getOrSetCallCookie = async (wsServer) => {
  const { CALL_API_USER, CALL_API_PASSWORD } = process.env;
  if (!CALL_API_USER && !CALL_API_PASSWORD) {
    throw new Error(`Required api credentials!`);
  }

  const pass = CALL_API_PASSWORD;

  const callCookie = await redis.get(`callCookie`);
  if (callCookie) {
    return callCookie;
  }
  const response = await fetch(`https://${wsServer}/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        action: 'challenge',
        user: CALL_API_USER || '',
        version: '1.2',
      },
    }),
  });
  const data = await response.json();

  const { challenge } = data?.response;

  const hashedPassword = crypto
    .createHash('md5')
    .update(challenge + pass)
    .digest('hex');

  // Send a new request to authenticate the user
  const loginResponse = await fetch(`https://${wsServer}/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      request: {
        action: 'login',
        user: CALL_API_USER || '',
        token: hashedPassword,
      },
    }),
  });

  const loginData = await loginResponse.json();
  const { cookie } = loginData.response;

  redis.set(`callCookie`, cookie, 'EX', 10 * 60);
  return cookie;
};

export const sendToGrandStreamRequest = async (
  models,
  args: {
    method: string;
    path: string;
    params?: any;
    data?: any;
    headers?: any;
    integrationId?: string;
    retryCount: number;
    isConvertToJson: boolean;
    isAddExtention?: boolean;
    isGetExtension?: boolean;
  },
  user,
) => {
  const {
    path,
    method,
    params,
    data,
    headers = {},
    integrationId,
    retryCount,
    isConvertToJson,
    isAddExtention,
    isGetExtension,
  } = args;

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  if (retryCount === 0) {
    throw new Error('Retry limit exceeded. Unable to fetch record URL.');
  }

  const integration = await models.Integrations.findOne({
    inboxId: integrationId,
  }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }
  const { wsServer = '' } = integration;
  const operator = integration.operators.find(
    (operator) => operator.userId === user?._id,
  );

  let cookie = await getOrSetCallCookie(wsServer);
  cookie = cookie?.toString();

  try {
    const requestOptions: RequestInit & Required<{ headers: HeadersInit }> = {
      method,
      headers,
    };
    const extentionNumber = operator?.gsUsername || '1001';

    if (data) {
      let request = { ...data };
      request.request.cookie = cookie;
      if (isAddExtention) {
        request.request.extension = extentionNumber;
      }

      requestOptions.body = JSON.stringify(request);
      requestOptions.headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(
      `https://${wsServer}/${path}` + new URLSearchParams(params),
      requestOptions,
    );

    if (isConvertToJson) {
      const response = await res.json();

      if (response.status === -6) {
        await redis.del('callCookie');
        return (await sendToGrandStreamRequest(
          models,
          {
            path: 'api',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data,
            integrationId,
            retryCount: retryCount - 1,
            isConvertToJson,
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
  } catch (e) {
    throw new Error(e.message);
  }
};

function findTransferCall(data) {
  for (const key in data) {
    if (data[key].action_type === 'TRANSFER') {
      return data[key];
    }
  }
  return null;
}
