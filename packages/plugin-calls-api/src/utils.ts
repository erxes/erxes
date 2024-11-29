import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import * as crypto from 'crypto';
import redis from '@erxes/api-utils/src/redis';
import { getEnv } from '@erxes/api-utils/src/core';
import * as FormData from 'form-data';
import * as momentTz from 'moment-timezone';

import type { RequestInit, HeadersInit } from 'node-fetch';
import { generateModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { Domain } from 'domain';

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || 'secret';
const CALL_API_EXPIRY = 10 * 60; // 10 minutes
const MAX_RETRY_COUNT = 3;

export const generateToken = async (integrationId, username?, password?) => {
  const payload = { integrationId, username, password };
  return jwt.sign(payload, JWT_TOKEN_SECRET);
};

export const sendRequest = async (url, options) => {
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
    data,
    headers = {},
    integrationId,
    retryCount,
    isConvertToJson,
    isAddExtention,
    isGetExtension,
    isCronRunning,
    extentionNumber: extension,
  } = args;

  if (retryCount <= 0) {
    throw new Error('Retry limit exceeded.');
  }

  const integration = await models.Integrations.findOne({
    inboxId: integrationId,
  }).lean();
  if (!integration) throw new Error('Integration not found');

  const { wsServer = '' } = integration;
  const operator = integration.operators.find((op) => op.userId === user?._id);
  const extentionNumber = isCronRunning
    ? extension
    : operator?.gsUsername || '1001';

  let cookie = await getOrSetCallCookie(wsServer);

  if (!cookie) {
    throw new Error('Cookie not found');
  }

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

export const getOrSetCallCookie = async (wsServer) => {
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
        request: {
          action: 'challenge',
          user: CALL_API_USER,
          version: '1.0.20.23',
        },
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
    console.log(cookie, 'cok');
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
    isCronRunning,
  } = params;
  if (transferedCallStatus === 'local' && callType === 'incoming') {
    return 'Check the transferred call record URL!';
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
          extentionNumber: history.extentionNumber,
          integrationId: inboxIntegrationId,
          retryCount,
          isConvertToJson: true,
          isGetExtension: true,
          isCronRunning: isCronRunning || false,
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
      const tz = 'Asia/Shanghai' || momentTz.tz.guess();
      const startDate = (
        momentTz(callStartTime).tz(tz) || momentTz(callStartTime)
      ).format('YYYY-MM-DD');
      const endDate = (
        momentTz(callEndTime).tz(tz) || momentTz(callStartTime)
      ).format('YYYY-MM-DD');

      let caller = customerPhone;
      let callee = extentionNumber || extension || operator;

      if (transferedCallStatus === 'remote') {
        callee = extentionNumber || extension;
      }

      let fileDir = 'monitor';
      if (callType === 'outgoing') {
        caller = extentionNumber;
        callee = customerPhone;
      }
      const startTime = isCronRunning
        ? getPureDate(callStartTime, -10)
        : `${startDate}T00:00:00`;
      const endTime = isCronRunning
        ? getPureDate(callEndTime, 10)
        : `${endDate}T23:59:59`;

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
              startTime,
              endTime,
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

      if (!cdrRoot) {
        console.log(
          'CDR root not found',
          caller,
          callee,
          'startedDate: ',
          startTime,
          endTime,
          callStartTime,
        );
        throw new Error('CDR root not found');
      }

      const sortedCdr = cdrRoot.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      let lastCreatedObject = sortedCdr[sortedCdr.length - 1];
      if (!lastCreatedObject) {
        console.log(
          'Not found cdr',
          caller,
          callee,
          'startedDate: ',
          startTime,
          endTime,
          callStartTime,
        );
        throw new Error('Not found cdr');
      }

      const transferCall = findTransferCall(lastCreatedObject);
      const answeredCall = findAnsweredCall(lastCreatedObject);

      if (answeredCall) {
        lastCreatedObject = answeredCall;
      }

      if (transferCall) {
        lastCreatedObject = transferCall;
        fileDir = 'monitor';
      }
      if (lastCreatedObject?.disposition !== 'ANSWERED' && !transferCall) {
        console.log(
          'caller callee:',
          caller,
          callee,
          'startedDate: ',
          startDate,
          callStartTime,
        );
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
      if (!recordfiles) {
        console.log(
          'record not found:',
          caller,
          callee,
          'startedDate: ',
          startDate,
          callStartTime,
        );
        throw new Error('Record files not found');
      }
      return await cfRecordUrl(
        { fileDir, recordfiles, inboxIntegrationId, retryCount },
        user,
        models,
        subdomain,
      );
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

const cfRecordUrl = async (params, user, models, subdomain) => {
  const { fileDir, recordfiles, inboxIntegrationId, retryCount } = params;
  const parts = recordfiles?.split('/');
  const fileNameWithoutExtension = parts?.[1]?.split('@')[0];
  if (fileNameWithoutExtension) {
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
    if (records) {
      const buffer = await records?.arrayBuffer();
      if (buffer) {
        const uploadUrl = getUrl(subdomain);
        console.log('uploadUrl:', uploadUrl);
        const formData = new FormData();
        formData.append('file', Buffer.from(buffer), {
          filename: fileNameWithoutExtension,
        });

        const rec = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        return await rec.text();
      }
    }
    return;
  }
  return;
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
    return transferredCalls[0];
  } else if (transferredCalls.length > 1) {
    return transferredCalls;
  }
  if (Array.isArray(data) && data.find) {
    return data.find((item) => item.action_type === 'TRANSFER');
  } else {
    return null;
  }
}

function findAnsweredCall(data: any): any {
  if (!data) {
    return null;
  }
  const answeredCalls = Object.values(data).filter((subCdr) => {
    const typedSubCdr = subCdr as any;
    return typedSubCdr.disposition === 'ANSWERED' && typedSubCdr.recordfiles;
  });

  if (answeredCalls.length === 1) {
    return answeredCalls[0];
  } else if (answeredCalls.length > 1) {
    return answeredCalls;
  }
  if (Array.isArray(data) && data.find) {
    return data.find((item) => item.disposition === 'ANSWERED');
  } else {
    return null;
  }
}

export const getPureDate = (date: Date, updateTime) => {
  const ndate = new Date(date);

  const diffTimeZone = Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;

  const updatedDate = new Date(ndate.getTime() + updateTime * 1000);

  return new Date(updatedDate.getTime() + diffTimeZone);
};

export const saveCdrData = async (subdomain, cdrData, result) => {
  const models = await generateModels(subdomain);

  try {
    for (const cdr of cdrData) {
      const history = createHistoryObject(cdr, result);
      await saveCallHistory(models, history);
      await processCustomerAndConversation(
        models,
        history,
        cdr,
        result,
        subdomain,
      );
    }
  } catch (error) {
    console.error(`Error in saveCdrData: ${error.message}`);
  }
};

const createHistoryObject = (cdr, result) => {
  const callType = cdr.userfield === 'Outbound' ? 'outgoing' : 'incoming';
  const customerPhone = cdr.userfield === 'Inbound' ? cdr.src : cdr.dst;

  return {
    operatorPhone: result.phone,
    customerPhone,
    callDuration: parseInt(cdr.billsec),
    callStartTime: new Date(cdr.start),
    callEndTime: new Date(cdr.end),
    callType,
    callStatus: cdr.disposition === 'ANSWERED' ? 'connected' : 'missed',
    timeStamp: cdr.cdr ? parseInt(cdr.cdr) : 0,
    createdAt: cdr.start ? new Date(cdr.start) : new Date(),
    extentionNumber: cdr.userfield === 'Inbound' ? cdr.dst : cdr.src,
    inboxIntegrationId: result.inboxId,
    recordFiles: cdr.recordfiles,
    queueName: cdr.lastdata ? cdr.lastdata.split(',')[0] : '',
    conversationId: '',
  };
};

const saveCallHistory = async (models, history) => {
  try {
    await models.CallHistory.updateOne(
      { timeStamp: history.timeStamp },
      { $set: history },
      { upsert: true },
    );
  } catch (error) {
    throw new Error(`Failed to save call history: ${error.message}`);
  }
};

const processCustomerAndConversation = async (
  models,
  history,
  cdr,
  result,
  subdomain,
) => {
  let customer = await models.Customers.findOne({
    primaryPhone: history.customerPhone,
  });
  if (!customer || !customer.erxesApiId) {
    customer = await getOrCreateCustomer(models, subdomain, {
      inboxIntegrationId: result.inboxId,
      primaryPhone: history.customerPhone,
    });
  }

  try {
    const conversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer?.erxesApiId,
          integrationId: result.inboxId,
          content: history.callType || '',
          conversationId: history.timeStamp,
          updatedAt: history.callStartTime,
          createdAt: history.callStartTime,
        }),
      },
      isRPC: true,
    });

    await models.CallHistory.updateOne(
      { timeStamp: history.timeStamp },
      { $set: { conversationId: conversationResponse._id } },
      { upsert: true },
    );
  } catch (error) {
    await models.CallHistory.deleteOne({ timeStamp: history.timeStamp });
    console.log(`Failed to handle conversation: ${error.message}`);
  }

  await handleRecordUrl(cdr, history, result, models, subdomain);
};

const handleRecordUrl = async (cdr, history, result, models, subdomain) => {
  if (history?.recordUrl) return;

  try {
    if (cdr?.recordfiles) {
      const recordPath = await cfRecordUrl(
        {
          fileDir: 'queue',
          recordfiles: cdr?.recordfiles,
          inboxIntegrationId: result.inboxId,
          retryCount: 1,
        },
        '',
        models,
        subdomain,
      );

      if (recordPath) {
        await models.CallHistory.updateOne(
          { timeStamp: history.timeStamp },
          { $set: { recordUrl: recordPath } },
          { upsert: true },
        );
      }
    }
  } catch (error) {
    console.log(`Failed to process record URL: ${error.message}`);
  }
};

export const getUrl = (subdomain) => {
  const VERSION = getEnv({ name: 'VERSION' });
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  let defaultValue = 'http://localhost:4000';

  if (VERSION === 'saas') {
    defaultValue = `http://${subdomain}.api.erxes.com`;
  }
  const DOMAIN = getEnv({
    name: 'DOMAIN',
    subdomain,
    defaultValue: NODE_ENV !== 'production' ? defaultValue : undefined,
  });

  const domain = DOMAIN.replace('<subdomain>', subdomain);

  if (NODE_ENV !== 'production') {
    return `${domain}/pl:core/upload-file`;
  }

  if (VERSION === 'saas') {
    return `https://${subdomain}.api.erxes.io/api/upload-file`;
  }

  return `${domain}/gateway/pl:core/upload-file`;
};
