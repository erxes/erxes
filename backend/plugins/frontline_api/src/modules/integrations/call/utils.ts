import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

import fetch from 'node-fetch';
import FormData from 'form-data';
import momentTz from 'moment-timezone';

import type { RequestInit, HeadersInit } from 'node-fetch';
import redis from '~/modules/integrations/call/redlock';
import { IModels, generateModels } from '~/connectionResolvers';
import { getEnv } from 'erxes-api-shared/utils';
import { ICallIntegrationDocument } from '~/modules/integrations/call/@types/integrations';
import { receiveInboxMessage } from '~/modules/inbox/receiveMessage';
import { ICallHistory } from '~/modules/integrations/call/@types/histories';
import { ICallCdrDocument } from '~/modules/integrations/call/@types/cdrs';

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || 'secret';
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

const getCallHistory = async (models: IModels, _id) => {
  const history = await models.CallHistory.findOne({ _id });
  if (!history) throw new Error('Call history not found');
  return history;
};

export const sendToGrandStream = async (models: IModels, args, user) => {
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
    extensionNumber: extension,
  } = args;

  if (retryCount <= 0) {
    throw new Error('Retry limit exceeded.');
  }

  const integration = await models.CallIntegrations.findOne({
    inboxId: integrationId,
  }).lean();
  if (!integration) throw new Error('Integration not found');

  const { wsServer = '' } = integration;
  const operator = integration.operators.find((op) => op.userId === user?._id);
  const extensionNumber = operator?.gsUsername || '1001';

  let cookie = await getOrSetCallCookie(wsServer);
  if (!cookie) {
    throw new Error('Cookie not found');
  }

  cookie = cookie?.toString();

  const isValid = await validateCookie(wsServer, cookie);
  if (!isValid) {
    await redis.del('callCookie');
    cookie = await getOrSetCallCookie(wsServer);
    if (!cookie) {
      throw new Error('Failed to refresh cookie');
    }
    cookie = cookie.toString();
  }

  const requestOptions: RequestInit & { headers: HeadersInit } = {
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      request: {
        ...data.request,
        cookie,
        ...(isAddExtention && { extension: extensionNumber }),
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
        return { response, extensionNumber };
      }
      return response;
    }

    if (isGetExtension) {
      return { res, extensionNumber };
    }

    return res;
  } catch (error) {
    console.error('Error in sendToGrandStream:', error);
    throw error;
  }
};

const validateCookie = async (
  wsServer: string,
  cookie: string,
): Promise<boolean> => {
  try {
    const requestOptions: RequestInit & { headers: HeadersInit } = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          action: 'getSystemStatus',
          cookie,
        },
      }),
    };

    const res = await sendRequest(`https://${wsServer}/api`, requestOptions);
    const response = await res.json();
    return response.status !== -6;
  } catch (error) {
    console.error('Error validating cookie:', error);
    return false;
  }
};

export const getOrSetCallCookie = async (wsServer) => {
  const {
    CALL_API_USER,
    CALL_API_PASSWORD,
    CALL_API_EXPIRY = '86400',
  } = process.env;
  // disable on production !!!
  // if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // }

  if (!CALL_API_USER || !CALL_API_PASSWORD) {
    throw new Error('Regular API credentials missing!');
  }
  const cookieKey = 'callCookie';
  const apiUser = CALL_API_USER;
  const apiPassword = CALL_API_PASSWORD;
  const expiry = CALL_API_EXPIRY;

  const callCookie = await redis.get(cookieKey);
  if (callCookie) {
    console.log(`Using existing regular cookie:`, callCookie);
    return callCookie;
  }

  try {
    const challengeResponse = await sendRequest(`https://${wsServer}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          action: 'challenge',
          user: apiUser,
          version: '1.0.20.23',
        },
      }),
    });

    const data = await challengeResponse.json();
    const { challenge } = data?.response ?? {};

    const token = crypto
      .createHash('md5')
      .update(challenge + apiPassword)
      .digest('hex');

    const loginResponse = await sendRequest(`https://${wsServer}/api`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          action: 'login',
          user: apiUser,
          token,
        },
      }),
    });

    const loginData = await loginResponse.json();
    if (loginData.status === 0) {
      const { cookie } = loginData.response;
      await redis.set(cookieKey, cookie, 'EX', expiry);
      console.log(`Stored new regular cookie:`, cookie);
      return cookie;
    }

    // Error handling
    if (errorList[loginData.status]) {
      console.error(
        `Auth failed for regular user:`,
        errorList[loginData.status],
        'apiUser:',
        apiUser,
      );
      throw new Error(errorList[loginData.status]);
    }
    throw new Error('Unknown authentication error');
  } catch (error) {
    console.error(`Error in regular auth:`, error);
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
    transferredCallStatus,
  } = params;
  if (transferredCallStatus === 'local' && callType === 'incoming') {
    return 'Check the transferred call record URL!';
  }

  const history = await getCallHistory(models, _id);
  const { inboxIntegrationId = '' } = history;
  const operator = operatorPhone || history.operatorPhone;
  const fetchRecordUrl = async (retryCount) => {
    try {
      const { response, extensionNumber } = await sendToGrandStream(
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
          extensionNumber: history.extensionNumber,
          integrationId: inboxIntegrationId,
          retryCount,
          isConvertToJson: true,
          isGetExtension: true,
        },
        user,
      );

      const queues = response?.response?.queue || response?.queue;
      if (!queues) {
        throw new Error('Queue not found');
      }

      const extension = queues.find((queueItem) =>
        queueItem.members.split(',').includes(extensionNumber),
      )?.extension;
      const tz = 'Asia/Ulaanbaatar';
      const startDate = (
        momentTz(callStartTime).tz(tz) || momentTz(callStartTime)
      ).format('YYYY-MM-DD');
      const endDate = (
        momentTz(callEndTime).tz(tz) || momentTz(callEndTime)
      ).format('YYYY-MM-DD');

      let caller = customerPhone;
      let callee = extensionNumber || extension || operator;

      if (transferredCallStatus === 'remote') {
        callee = extensionNumber || extension;
      }

      let fileDir = 'monitor';
      if (callType === 'outgoing') {
        caller = extensionNumber;
        callee = customerPhone;
      }
      const startTime = `${startDate}T00:00:00`;
      const endTime = `${endDate}T23:59:59`;
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

      const cdrRoot = cdrData.response?.cdr_root || cdrData.cdr_root;

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
        ['QUEUE', 'TRANSFER'].some((substring) =>
          lastCreatedObject?.action_type?.includes(substring),
        ) &&
        !(transferredCallStatus === 'remote' && callType === 'incoming')
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
      console.error('Error in fetchRecordUrl:', error.message);
      if (
        error.message !== 'Success' &&
        Object.values(errorList).includes(error.message)
      ) {
        throw error;
      }
      if (retryCount > 1) {
        return fetchRecordUrl(retryCount - 1);
      }
      throw error;
    }
  };

  return fetchRecordUrl(MAX_RETRY_COUNT);
};

function sanitizeFileName(rawFileName: string): string {
  return rawFileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}
export const cfRecordUrl = async (params, user, models, subdomain) => {
  try {
    const { fileDir, recordfiles, inboxIntegrationId, retryCount } = params;

    if (!recordfiles) {
      throw new Error('Missing required parameter: recordfiles');
    }

    const filePathParts = recordfiles.split('/');
    const rawFileName = filePathParts[1]?.split('@')[0];

    if (!rawFileName) {
      console.warn('Could not extract filename from recordfiles path');
      return;
    }

    // Fetch file buffer from GrandStream API
    const grandStreamResponse = await sendToGrandStream(
      models,
      {
        path: 'api',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          request: {
            action: 'recapi',
            filedir: fileDir,
            filename: rawFileName,
          },
        },
        integrationId: inboxIntegrationId,
        retryCount,
        isConvertToJson: false,
      },
      user,
    );

    if (!grandStreamResponse) {
      throw new Error('Failed to get response from GrandStream API');
    }
    const fileBuffer = await grandStreamResponse.arrayBuffer();
    if (!fileBuffer) {
      throw new Error('Received empty buffer from GrandStream API');
    }
    // Prepare file upload
    const uploadUrl = getUrl(subdomain);
    const sanitizedFileName = sanitizeFileName(rawFileName);

    const formData = new FormData();
    formData.append('file', Buffer.from(fileBuffer), {
      filename: sanitizedFileName,
    });

    console.log(uploadUrl, 'uploadUrl');

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const responseText = await uploadResponse.text();
    return responseText;
  } catch (error) {
    console.error('Error in cfRecordUrl:', error);
    throw error;
  }
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

const isValidSubdomain = (subdomain) => {
  const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  return subdomainRegex.test(subdomain);
};

export const getUrl = (subdomain) => {
  const VERSION = getEnv({ name: 'VERSION' });
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });

  if (!isValidSubdomain(subdomain)) {
    throw new Error('Invalid subdomain format');
  }

  const domain = getDomain(subdomain);
  if (
    subdomain.includes('../') ||
    subdomain.includes('..\\') ||
    subdomain.includes('/')
  ) {
    throw new Error('Invalid characters in subdomain');
  }

  if (NODE_ENV !== 'production') {
    return `${domain}/upload-file`;
  }

  if (VERSION === 'saas') {
    return `https://${domain}/api/upload-file`;
  }

  return `${domain}/gateway/pl:core/upload-file`;
};

export const getDomain = (subdomain) => {
  const defaultValue = 'http://localhost:4000';
  const VERSION = getEnv({ name: 'VERSION' });

  const baseDefault =
    VERSION === 'os' ? defaultValue : `http://${subdomain}.api.erxes.com`;

  const DOMAIN = getEnv({
    name: 'DOMAIN',
    subdomain,
    defaultValue: baseDefault,
  });

  return DOMAIN.replace('<subdomain>', subdomain);
};

interface FindIntegrationArgs {
  queueName?: string;
  inboxIntegrationId?: string;
}

export const findIntegration = async (
  subdomain: string,
  args: FindIntegrationArgs,
): Promise<ICallIntegrationDocument> => {
  let integration: ICallIntegrationDocument | null = null;
  const models = await generateModels(subdomain);

  if (args.queueName) {
    // Try to find integration by queueName first
    integration = await models.CallIntegrations.findOne({
      queueNames: { $in: [args.queueName] },
    });

    // If not found, try to find by inboxId
    if (!integration && args.inboxIntegrationId) {
      integration = await models.CallIntegrations.findOne({
        inboxId: args.inboxIntegrationId,
      }).lean();
    }
  } else if (args.inboxIntegrationId) {
    // If queueName is not provided, directly search by inboxId
    integration = await models.CallIntegrations.findOne({
      inboxId: args.inboxIntegrationId,
    }).lean();
  }

  if (!integration) {
    throw new Error('Integration not found');
  }

  return integration;
};

export const checkForExistingIntegrations = async (
  subdomain,
  details,
  integrationId,
) => {
  const queues =
    typeof details?.queues === 'string'
      ? details.queues.split(',').flatMap((q) => q.trim().split(/\s+/))
      : (details?.queues || []).flatMap((q) =>
          typeof q === 'string' ? q.trim().split(/\s+/) : q,
        );

  const models = await generateModels(subdomain);
  // Check for existing integrations with the same wsServer and overlapping queues
  const existingIntegrations = await models.CallIntegrations.find({
    wsServer: details.wsServer, // Match same wsServer
    queues: { $in: queues }, // Check if any queue already exists
  }).lean();
  if (existingIntegrations.length > 0) {
    existingIntegrations.forEach((existingIntegration) => {
      if (existingIntegration.inboxId.toString() !== integrationId.toString()) {
        throw new Error(
          'One or more queues already exist in the integration with the same wsServer.',
        );
      }
    });
  }

  details.queues = queues;
  return details || {};
};

export const updateIntegrationQueues = async (
  subdomain,
  integrationId,
  details,
) => {
  try {
    const models = await generateModels(subdomain);

    // Normalize and clean queue list
    const checkedIntegration = await checkForExistingIntegrations(
      subdomain,
      details,
      integrationId,
    );
    const { queues } = checkedIntegration;
    // Prepare update data
    const updateData = { $set: { queues, ...details }, $upsert: true };

    // Update the integration
    const integration = await models.CallIntegrations.findOneAndUpdate(
      { inboxId: integrationId },
      updateData,
    );

    return integration?.queues || queues;
  } catch (error) {
    console.error('Error updating integration queues:', error.message);
    throw error;
  }
};

export const updateIntegrationQueueNames = async (
  subdomain,
  integrationId,
  queues,
) => {
  try {
    const models = await generateModels(subdomain);
    const queueNames: string[] = [];

    if (queues?.length > 0) {
      await Promise.all(
        queues.map(async (queue) => {
          try {
            const { response } = await sendToGrandStream(
              models,
              {
                path: 'api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: { request: { action: 'getQueue', queue } },
                integrationId: integrationId,
                retryCount: 1,
                isConvertToJson: true,
                isGetExtension: true,
              },
              {},
            );

            const q = response?.response?.queue || response?.queue;
            if (q?.queue_name) {
              queueNames.push(q.queue_name);
            }
          } catch (e) {
            console.error('getQueue error:', e.message);
            throw new Error(`getQueue error: ${e.message}`);
          }
        }),
      );
    }
    if (queueNames.length > 0) {
      // Prepare update data
      const updateData = { $set: { queueNames } };

      // Update the integration
      const integration = await models.CallIntegrations.findOneAndUpdate(
        { inboxId: integrationId },
        updateData,
      );

      return integration?.queueNames || queueNames;
    }

    return [];
  } catch (error) {
    console.error('Error updating integration queue names:', error.message);
    throw error;
  }
};

type ErrorList = {
  [key: number]: string;
};

const errorList: ErrorList = {
  0: 'Success',
  [-1]: 'Invalid parameters',
  [-5]: 'Need authentication',
  [-7]: 'Connection closed',
  [-8]: 'System timeout',
  [-9]: 'Abnormal system error!',
  [-15]: 'Invalid value',
  [-16]: 'No such item. Please refresh the page and try again',
  [-19]: 'Unsupported',
  [-24]: 'Failed to operate data',
  [-25]: 'Failed to update data',
  [-26]: 'Failed to get data',
  [-37]: 'Wrong account or password!',
  [-43]:
    'Some data on this page has been modified or deleted. Please refresh the page and try again',
  [-44]: 'This item has been added',
  [-45]:
    'Operating too frequently or other users are doing the same operation. Please retry after 15 seconds',
  [-46]:
    'Operating too frequently or other users are doing the same operation. Please retry after 15 seconds',
  [-47]: 'No permission',
  [-50]: 'Command contains sensitive characters',
  [-51]: 'Another task is running now',
  [-57]:
    'Operating too frequently, or other users are doing the same operation. Please retry after 60 seconds',
  [-68]: 'Login restriction',
  [-69]:
    'There is currently a conference going on. Changes cannot be applied at this time',
  [-70]: 'Login forbidden',
  [-71]: "The username doesn't exist",
  [-90]: 'The conference is busy, cannot be edited or deleted',
  [-98]: 'There are currently digital calls. Failed to apply configuration',
};

export const toCamelCase = (obj) => {
  const camelCaseObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      camelCaseObj[camelCaseKey] = obj[key];
    }
  }
  return camelCaseObj;
};

export function validateArgs(data: any): void {
  if (!data?.erxesApiConversationId) {
    throw new Error('Conversation ID is required.');
  }
}

export const createOrUpdateErxesConversation = async (subdomain, payload) => {
  const apiResponse = await updateErxesConversation(subdomain, payload);
  return apiResponse;
};

const updateErxesConversation = async (subdomain, payload) => {
  const data = {
    action: 'create-or-update-conversation',
    payload,
  };

  return await receiveInboxMessage(subdomain, data);
};

// Enhanced WebSocket Handler with improved publishing
export function enhancedHandleCallEvent(json, graphqlPubsub) {
  try {
    if (json.type !== 'request') return;

    const messages = Array.isArray(json.message)
      ? json.message
      : [json.message];

    for (const message of messages) {
      const { eventname, eventbody } = message;

      switch (eventname) {
        case 'CallQueueStatus':
          handleCallQueueStatus(eventbody, graphqlPubsub);
          break;

        case 'ActiveCallStatus':
          handleActiveCallStatus(eventbody, graphqlPubsub);
          break;

        default:
          console.log(`⚠️ Unhandled event: ${eventname}`);
      }
    }
  } catch (error) {
    console.error('❌ Error handling call event:', error);
  }
}

function handleCallQueueStatus(eventBody, graphqlPubsub) {
  const events = Array.isArray(eventBody) ? eventBody : [eventBody];

  events.forEach((item) => {
    const { extension } = item;

    if (item.member) {
      if (extension) {
        graphqlPubsub.publish(`callAgent_${extension}`, {
          callStatistic: item,
        });
      }

      graphqlPubsub.publish('callAgent', {
        callStatistic: item,
      });

      if (extension) {
        graphqlPubsub.publish(`queueStatus_${extension}`, {
          callStatistic: item,
        });
      }
    } else {
      console.log('📊 Statistics event:', item);

      if (extension) {
        graphqlPubsub.publish(`callStatistic_${extension}`, {
          callStatistic: item,
        });
      }

      graphqlPubsub.publish('callStatistic', {
        callStatistic: item,
      });

      if (extension) {
        graphqlPubsub.publish(`queueStatus_${extension}`, {
          callStatistic: item,
        });
      }
    }
  });
}

function handleActiveCallStatus(eventBody, graphqlPubsub) {
  const events = Array.isArray(eventBody) ? eventBody : [eventBody];

  events.forEach((callEvent) => {
    const { feature_calleenum, action, state, callernum, connectednum } =
      callEvent;

    if (feature_calleenum) {
      graphqlPubsub.publish(`activeCallStatus_${feature_calleenum}`, {
        activeCallStatus: callEvent,
      });
    }

    graphqlPubsub.publish('activeCallStatus', {
      activeCallStatus: callEvent,
    });

    switch (action) {
      case 'add':
        console.log(`📞 NEW CALL: ${callernum} → ${connectednum} (${state})`);
        break;
      case 'update':
        console.log(
          `📞 CALL UPDATE: ${callernum} → ${connectednum} (${state})`,
        );
        break;
      case 'delete':
        console.log(`📞 CALL ENDED: ${callEvent.channel}`);
        break;
    }
  });
}
export const mapCdrToCallHistory = (
  cdr: ICallCdrDocument,
): ICallHistory & { acctId: string } => {
  return {
    operatorPhone: cdr.userfield === 'Inbound' ? cdr.dst : cdr.src || '',
    customerPhone: cdr.userfield === 'Inbound' ? cdr.src : cdr.dst || '',
    callDuration: cdr.billsec || 0,
    callStartTime: cdr.start,
    callEndTime: cdr.end,
    callType: cdr.userfield || '',
    callStatus: cdr.disposition || '',
    timeStamp: cdr.start ? cdr.start.getTime() / 1000 : 0,
    modifiedAt: cdr.updatedAt,
    createdAt: cdr.createdAt,
    createdBy: cdr.createdBy || '',
    modifiedBy: cdr.updatedBy || '',
    extensionNumber: '',
    conversationId: cdr.conversationId || '',
    recordUrl: cdr.recordUrl || '',
    endedBy: '',
    acceptedUserId: '',
    queueName: '',
    inboxIntegrationId: cdr.inboxIntegrationId,
    acctId: cdr.acctId || '',
  };
};
