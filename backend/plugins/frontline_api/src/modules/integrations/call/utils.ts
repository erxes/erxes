import crypto from 'crypto';
import https from 'https';

import fetch from 'node-fetch';
import FormData from 'form-data';

import type { RequestInit } from 'node-fetch';
import redis from '@/integrations/call/redlock';
import { IModels, generateModels } from '~/connectionResolvers';
import { getEnv, ExpectedError } from 'erxes-api-shared/utils';
import { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { ICallHistory } from '@/integrations/call/@types/histories';
import { ICallCdrDocument } from '@/integrations/call/@types/cdrs';
import { ICallSessionDocument } from '@/integrations/call/@types/callSessions';

const MAX_RETRY_COUNT = 3;
const UCM_REQUEST_TIMEOUT_MS = 60_000;
const RECORD_UPLOAD_TIMEOUT_MS = 120_000;
// A UCM error is a tiny JSON object; anything larger is a file.
const UCM_JSON_SNIFF_BYTES = 16 * 1024;

// UCMs ship self-signed certificates. Trust them on UCM requests only.
const ucmAgent = new https.Agent({ rejectUnauthorized: false });

export interface IUcmResponse {
  body: Buffer;
  contentType: string;
}

/*
 * Sends a request to a UCM and reads the whole body inside the timeout, so a
 * caller never holds a half-read node-fetch stream.
 */
export const sendRequest = async (
  url: string,
  options: RequestInit,
  timeoutMs = UCM_REQUEST_TIMEOUT_MS,
): Promise<IUcmResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      agent: ucmAgent,
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      body: await response.buffer(),
      contentType: response.headers.get('content-type') || '',
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ExpectedError(
        `Call integration server did not answer within ${
          timeoutMs / 1000
        } seconds.`,
      );
    }

    if (
      error instanceof Error &&
      (error.message.includes('ENOTFOUND') ||
        error.message.includes('getaddrinfo'))
    ) {
      throw new ExpectedError(
        'Call integration server is not reachable. Please check your wsServer configuration.',
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const parseUcmJson = (body: Buffer) => {
  try {
    return JSON.parse(body.toString('utf8'));
  } catch {
    return null;
  }
};

const ucmError = (status?: number) =>
  (status !== undefined && errorList[status]) || `status ${status}`;

export interface IGrandStreamRequest {
  method: string;
  path: string;
  data: { request: Record<string, unknown> };
  headers?: Record<string, string>;
  integrationId: string;
  retryCount?: number;
  isConvertToJson?: boolean;
  isAddExtention?: boolean;
  isGetExtension?: boolean;
  extensionNumber?: string;
}

export const sendToGrandStream = async (
  models: IModels,
  args: IGrandStreamRequest,
  user?: { _id?: string } | null,
) => {
  const {
    method,
    path,
    data,
    headers = {},
    integrationId,
    retryCount = MAX_RETRY_COUNT,
    isConvertToJson,
    isAddExtention,
    isGetExtension,
    extensionNumber: requestedExtension,
  } = args;

  if (retryCount <= 0) {
    throw new Error('Retry limit exceeded.');
  }

  const integration = await models.CallIntegrations.findOne({
    inboxId: integrationId,
  }).lean();
  if (!integration) throw new Error('Integration not found');

  const { wsServer = '' } = integration;
  const extensionNumber =
    requestedExtension ||
    integration.operators.find((op) => op.userId === user?._id)?.gsUsername;

  if ((isAddExtention || isGetExtension) && !extensionNumber) {
    throw new ExpectedError(
      'You have no call extension on this integration. Ask an admin to add you as an operator.',
    );
  }

  const cookie = await getOrSetCallCookie(wsServer);

  const res = await sendRequest(`https://${wsServer}/${path}`, {
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
  });

  const json =
    isConvertToJson || res.body.length < UCM_JSON_SNIFF_BYTES
      ? parseUcmJson(res.body)
      : null;

  if (json?.status === -6) {
    console.warn(
      `[call] UCM cookie expired for ${wsServer}, refreshing (${
        retryCount - 1
      } retries left)`,
    );
    await refreshCallCookie(wsServer, cookie);
    return sendToGrandStream(
      models,
      { ...args, retryCount: retryCount - 1 },
      user,
    );
  }

  if (isConvertToJson) {
    if (!json) {
      throw new Error('Call integration server returned a non-JSON response');
    }
    return isGetExtension ? { response: json, extensionNumber } : json;
  }

  if (json) {
    throw new Error(
      `Call integration server returned ${ucmError(
        json.status,
      )} instead of a file`,
    );
  }

  return res.body;
};

const callCookieKey = (wsServer: string) => `callCookie:${wsServer}`;

const cookieLogins = new Map<string, Promise<string>>();

const ucmApi = async (wsServer: string, request: Record<string, unknown>) => {
  const res = await sendRequest(`https://${wsServer}/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request }),
  });
  return parseUcmJson(res.body);
};

const loginToUcm = async (wsServer: string) => {
  const {
    CALL_API_USER,
    CALL_API_PASSWORD,
    CALL_API_EXPIRY = '86400',
  } = process.env;

  if (!CALL_API_USER || !CALL_API_PASSWORD) {
    throw new Error('Regular API credentials missing!');
  }

  const challengeData = await ucmApi(wsServer, {
    action: 'challenge',
    user: CALL_API_USER,
    version: '1.0.20.23',
  });
  const challenge = challengeData?.response?.challenge;
  if (challengeData?.status !== 0 || !challenge) {
    throw new Error(`UCM challenge failed: ${ucmError(challengeData?.status)}`);
  }

  const token = crypto
    .createHash('md5')
    .update(challenge + CALL_API_PASSWORD)
    .digest('hex');

  const loginData = await ucmApi(wsServer, {
    action: 'login',
    user: CALL_API_USER,
    token,
  });
  const cookie = loginData?.response?.cookie;
  if (loginData?.status !== 0 || !cookie) {
    throw new Error(`UCM login failed: ${ucmError(loginData?.status)}`);
  }

  await redis.set(
    callCookieKey(wsServer),
    cookie,
    'EX',
    Number(CALL_API_EXPIRY) || 86400,
  );
  return String(cookie);
};

/*
 * One login per UCM at a time in this process. Requests that hit an expired
 * cookie together share the same refresh instead of each logging in.
 */
const loginOnce = (wsServer: string, staleCookie?: string) => {
  const pending = cookieLogins.get(wsServer);
  if (pending) return pending;

  const login = (async () => {
    const cached = await redis.get(callCookieKey(wsServer));
    if (cached && cached !== staleCookie) return cached;
    return loginToUcm(wsServer);
  })().finally(() => cookieLogins.delete(wsServer));

  cookieLogins.set(wsServer, login);
  return login;
};

export const getOrSetCallCookie = async (wsServer: string) => {
  const cached = await redis.get(callCookieKey(wsServer));
  return cached || loginOnce(wsServer);
};

const refreshCallCookie = (wsServer: string, staleCookie: string) =>
  loginOnce(wsServer, staleCookie);

export const clearCallCookies = async () => {
  const stream = redis.scanStream({ match: 'callCookie*', count: 100 });
  for await (const keys of stream) {
    const batch: string[] = keys;
    if (batch.length) await redis.del(...batch);
  }
};

function sanitizeFileName(rawFileName: string): string {
  return rawFileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/*
 * `recordfiles` is an `@`-separated list of paths such as
 * `2024-05/auto-1715.wav@`, `/monitor/a/b.wav` or a bare `b.wav`.
 * recapi takes the bare name of the first file.
 */
export const recordFileName = (recordfiles: string) => {
  const [firstFile = ''] = recordfiles
    .split('@')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return firstFile.split('/').filter(Boolean).pop() || '';
};

export interface IRecordFileParams {
  fileDir: string;
  recordfiles: string;
  inboxIntegrationId: string;
  retryCount?: number;
}

export const cfRecordUrl = async (
  { fileDir, recordfiles, inboxIntegrationId, retryCount }: IRecordFileParams,
  user: { _id?: string } | null,
  models: IModels,
  subdomain: string,
) => {
  if (!recordfiles) throw new Error('Missing required parameter: recordfiles');

  const rawFileName = recordFileName(recordfiles);
  if (!rawFileName) {
    throw new Error(`No file name in recordfiles "${recordfiles}"`);
  }

  const fileBuffer: Buffer = await sendToGrandStream(
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

  if (!fileBuffer?.length) {
    throw new Error('Received an empty recording from the call server');
  }

  const formData = new FormData();
  formData.append('file', fileBuffer, sanitizeFileName(rawFileName));

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    RECORD_UPLOAD_TIMEOUT_MS,
  );

  try {
    const uploadResponse = await fetch(getUrl(subdomain), {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    const responseText = await uploadResponse.text();

    if (!uploadResponse.ok) {
      throw new Error(
        `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${responseText}`,
      );
    }

    return responseText;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Recording upload timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

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
    return `${domain}/gateway/upload-file`;
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
      });
    }
  } else if (args.inboxIntegrationId) {
    // If queueName is not provided, directly search by inboxId
    integration = await models.CallIntegrations.findOne({
      inboxId: args.inboxIntegrationId,
    });
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
  const queues = (
    typeof details?.queues === 'string'
      ? details.queues.split(',').flatMap((q) => q.trim().split(/\s+/))
      : (details?.queues || []).flatMap((q) =>
          typeof q === 'string' ? q.trim().split(/\s+/) : q,
        )
  ).filter(Boolean);

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

export type ICallOperator = {
  userId: string;
  gsUsername: string;
  gsPassword: string;
  gsForwardAgent: boolean;
};

export const sanitizeOperators = (
  input: any,
  existing: any[] = [],
): ICallOperator[] => {
  if (!Array.isArray(input)) {
    return [];
  }

  const prevByUser = new Map(
    (existing || [])
      .filter((op) => op && op.userId)
      .map((op) => [String(op.userId), op]),
  );

  const result: ICallOperator[] = [];

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }

    const userId = typeof raw.userId === 'string' ? raw.userId : '';
    const gsUsername =
      typeof raw.gsUsername === 'string' ? raw.gsUsername.trim() : '';

    if (!gsUsername) {
      continue;
    }

    const prev = prevByUser.get(String(userId));
    const gsPassword =
      typeof raw.gsPassword === 'string' && raw.gsPassword.length > 0
        ? raw.gsPassword
        : prev?.gsPassword || '';
    const gsForwardAgent =
      typeof raw.gsForwardAgent === 'boolean'
        ? raw.gsForwardAgent
        : !!prev?.gsForwardAgent;

    result.push({ userId, gsUsername, gsPassword, gsForwardAgent });
  }

  return result;
};

const SETTABLE_INTEGRATION_FIELDS = [
  'phone',
  'wsServer',
  'srcTrunk',
  'dstTrunk',
  'queueNames',
];

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

    const $set: Record<string, any> = { queues };
    for (const key of SETTABLE_INTEGRATION_FIELDS) {
      if (details[key] !== undefined) {
        $set[key] = details[key];
      }
    }

    if (details.operators !== undefined) {
      const current = await models.CallIntegrations.findOne({
        inboxId: integrationId,
      }).lean();
      $set.operators = sanitizeOperators(details.operators, current?.operators);
    }

    // Update the integration
    const integration = await models.CallIntegrations.findOneAndUpdate(
      { inboxId: integrationId },
      { $set },
      { new: true },
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
            const response = await sendToGrandStream(
              models,
              {
                path: 'api',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                data: { request: { action: 'getQueue', queue } },
                integrationId: integrationId,
                retryCount: 3,
                isConvertToJson: true,
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

export const normalizeQueueStat = (q: any, integrationId: string) => ({
  queuechairman: q.queuechairman ?? q.queueChairman ?? '',
  queue: String(q.queue),
  totalCalls: q.total_calls ?? q.totalCalls ?? 0,
  answeredCalls: q.answered_calls ?? q.answeredCalls ?? 0,
  answeredRate: q.answered_rate ?? q.answeredRate ?? 0,
  abandonedCalls: q.abandoned_calls ?? q.abandonedCalls ?? 0,
  avgWait: q.avg_wait ?? q.avgWait ?? 0,
  avgTalk: q.avg_talk ?? q.avgTalk ?? 0,
  vqTotalCalls: q.vq_total_calls ?? q.vqTotalCalls ?? 0,
  slaRate: q.sla_rate ?? q.slaRate ?? 0,
  vqSlaRate: q.vq_sla_rate ?? q.vqSlaRate ?? 0,
  transferOutCalls: q.transfer_out_calls ?? q.transferOutCalls ?? 0,
  transferOutRate: q.transfer_out_rate ?? q.transferOutRate ?? 0,
  abandonedRate: q.abandoned_rate ?? q.abandonedRate ?? 0,
  integrationId,
});

export const upsertQueueStatistics = async (
  models: IModels,
  integration: ICallIntegrationDocument,
  payload: any,
): Promise<{ upserted: number }> => {
  const integrationId = integration?.inboxId;
  if (!integrationId) {
    throw new Error('Integration not resolved');
  }

  const raw =
    payload?.root_statistics?.queue ??
    payload?.queue ??
    payload?.queues ??
    payload;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const allowed = (integration.queues || []).map(String);

  const normalized = list
    .filter((q) => q && q.queue !== undefined && q.queue !== null)
    .map((q) => normalizeQueueStat(q, integrationId))
    .filter((q) => allowed.includes(String(q.queue)));

  for (const stat of normalized) {
    await models.CallQueueStatistics.findOneAndUpdate(
      { integrationId, queue: stat.queue },
      { $set: stat },
      { upsert: true, new: true },
    );
  }

  return { upserted: normalized.length };
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
const deriveCdrCallStatus = (cdr: ICallCdrDocument): string => {
  const disposition = (cdr.disposition || '').toUpperCase();
  const actionType = cdr.actionType || '';

  const isHumanAnswered =
    disposition === 'ANSWERED' &&
    (cdr.billsec || 0) > 0 &&
    ['Queue', 'Dial'].includes(cdr.lastapp || '') &&
    !actionType.includes('VM');

  if (disposition === 'ANSWERED' && !isHumanAnswered) {
    if (actionType.includes('IVR')) return 'IVR';
    if (actionType.includes('VM')) return 'VOICEMAIL';
  }

  return cdr.disposition || '';
};

export const mapCdrToCallHistory = (
  cdr: ICallCdrDocument,
): ICallHistory & { acctId: string } => {
  const isForwarded = (cdr.actionType || '').includes('FOLLOWME');
  const isInbound = cdr.userfield === 'Inbound' || isForwarded;

  return {
    operatorPhone: isInbound ? cdr.dst : cdr.src || '',
    customerPhone: isInbound ? cdr.src : cdr.dst || '',
    callDuration: cdr.billsec || 0,
    callStartTime: cdr.start,
    callEndTime: cdr.end,
    callType: isForwarded ? 'Inbound' : cdr.userfield || '',
    callStatus: deriveCdrCallStatus(cdr),
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

export const mapSessionToCallHistory = (
  session: ICallSessionDocument,
): ICallHistory & { acctId: string } => {
  return {
    operatorPhone: session.operatorPhone || '',
    customerPhone: session.customerPhone || '',
    callDuration: session.durationSec || 0,
    callStartTime: session.startedAt,
    callEndTime: session.endedAt as Date,
    callType: session.callType,
    callStatus: session.status || '',
    timeStamp: session.startedAt ? session.startedAt.getTime() / 1000 : 0,
    modifiedAt: session.updatedAt,
    createdAt: session.createdAt,
    createdBy: '',
    modifiedBy: '',
    extensionNumber: session.answeredExtension || '',
    conversationId: session.conversationId || '',
    recordUrl: session.recordUrl || '',
    endedBy: '',
    acceptedUserId: '',
    queueName: session.queueName || '',
    inboxIntegrationId: session.inboxIntegrationId,
    acctId: session.cdrAcctId || '',
    uniqueid: session.uniqueid,
  };
};

export async function getInboundStats(models, startDate, endDate) {
  const data = await models.CallCdrs.aggregate([
    {
      $match: {
        start: { $gte: new Date(startDate) },
        end: { $lte: new Date(endDate) },
        userfield: 'Inbound',
      },
    },
    {
      $group: {
        _id: '$uniqueid',
        dispositions: { $addToSet: '$disposition' },
      },
    },
    {
      $project: {
        isAnswered: { $in: ['ANSWERED', '$dispositions'] },
        isFailed: {
          $anyElementTrue: {
            $map: {
              input: '$dispositions',
              as: 'd',
              in: {
                $in: ['$d', ['FAILED', 'BUSY', 'CONGESTION', 'CHANUNAVAIL']],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalInbound: { $sum: 1 },
        answered: { $sum: { $cond: ['$isAnswered', 1, 0] } },
        failed: { $sum: { $cond: ['$isFailed', 1, 0] } },
        missed: {
          $sum: {
            $cond: [
              { $and: [{ $not: ['$isAnswered'] }, { $not: ['$isFailed'] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return data[0];
}

export async function getQueueStatsByDateRange(
  models,
  startDate,
  endDate,
  queueId = null,
) {
  const matchStage = {
    userfield: 'Inbound',
    start: { $gte: new Date(startDate) },
    end: { $lte: new Date(endDate) },
  };

  const data = await models.CallCdrs.aggregate([
    {
      $match: matchStage,
    },

    {
      $addFields: {
        queue: {
          $cond: [
            {
              $regexMatch: {
                input: { $ifNull: ['$actionType', ''] },
                regex: /QUEUE\[/,
              },
            },
            {
              $arrayElemAt: [
                {
                  $split: [
                    {
                      $arrayElemAt: [{ $split: ['$actionType', 'QUEUE['] }, 1],
                    },
                    ']',
                  ],
                },
                0,
              ],
            },
            null,
          ],
        },
      },
    },

    {
      $match: {
        queue: queueId ? queueId : { $ne: null },
      },
    },

    {
      $group: {
        _id: { queue: '$queue', uniqueid: '$uniqueid' },
        dispositions: { $addToSet: '$disposition' },
        billsec: { $max: '$billsec' },
        duration: { $max: '$duration' },
        waitTime: { $max: '$waittime' },
        lastapp: { $last: '$lastapp' },
        dst: { $last: '$dst' },
      },
    },

    {
      $project: {
        queue: '$_id.queue',
        isAnswered: {
          $and: [
            { $in: ['ANSWERED', '$dispositions'] },
            { $gt: ['$billsec', 0] },
            {
              $or: [
                { $eq: ['$lastapp', 'Queue'] },
                { $eq: ['$lastapp', 'Playback'] },
              ],
            },
          ],
        },
        isAbandoned: {
          $or: [
            { $not: [{ $in: ['ANSWERED', '$dispositions'] }] },
            {
              $and: [
                { $in: ['ANSWERED', '$dispositions'] },
                { $eq: ['$billsec', 0] },
              ],
            },
          ],
        },

        billsec: 1,
        waitTime: { $ifNull: ['$waitTime', 0] },
      },
    },

    {
      $group: {
        _id: '$queue',
        totalCalls: { $sum: 1 },
        answeredCalls: { $sum: { $cond: ['$isAnswered', 1, 0] } },
        abandonedCalls: { $sum: { $cond: ['$isAbandoned', 1, 0] } },
        totalWaitTime: {
          $sum: {
            $cond: ['$isAnswered', '$waitTime', 0],
          },
        },
        totalTalkTime: {
          $sum: {
            $cond: ['$isAnswered', '$billsec', 0],
          },
        },
      },
    },

    {
      $project: {
        queue: '$_id',
        totalCalls: 1,
        answeredCalls: 1,
        answeredRate: {
          $cond: [
            { $gt: ['$totalCalls', 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$answeredCalls', '$totalCalls'] },
                    100,
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },
        abandonedCalls: 1,
        abandonedRate: {
          $cond: [
            { $gt: ['$totalCalls', 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$abandonedCalls', '$totalCalls'] },
                    100,
                  ],
                },
                2,
              ],
            },
            0,
          ],
        },

        averageWaitTime: {
          $cond: [
            { $gt: ['$answeredCalls', 0] },
            { $round: [{ $divide: ['$totalWaitTime', '$answeredCalls'] }, 2] },
            0,
          ],
        },
        averageTalkTime: {
          $cond: [
            { $gt: ['$answeredCalls', 0] },
            { $round: [{ $divide: ['$totalTalkTime', '$answeredCalls'] }, 2] },
            0,
          ],
        },
      },
    },

    { $sort: { queue: 1 } },
  ]);

  return data;
}

export async function getDailyCallRecords(models, startDate, endDate) {
  return await models.CallCdrs.aggregate([
    {
      $match: {
        start: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },

    {
      $addFields: {
        queue: {
          $cond: [
            { $regexMatch: { input: '$actionType', regex: /QUEUE\[/ } },
            {
              $arrayElemAt: [
                {
                  $split: [
                    {
                      $arrayElemAt: [{ $split: ['$actionType', 'QUEUE['] }, 1],
                    },
                    ']',
                  ],
                },
                0,
              ],
            },
            null,
          ],
        },
      },
    },
    {
      $match: {
        queue: '6502',
        disposition: { $ne: 'ANSWERED' },
        billsec: { $eq: 0 },
      },
    },

    {
      $group: {
        _id: '$uniqueid',

        src: { $first: '$src' },
        dst: { $first: '$dst' },
        userfield: { $first: '$userfield' },
        callerName: { $first: '$callerName' },

        start: { $first: '$start' },
        end: { $max: '$end' },

        totalDuration: { $sum: '$duration' },
        totalBillsec: { $sum: '$billsec' },

        dispositions: { $addToSet: '$disposition' },

        queues: { $addToSet: '$queue' },

        cdrList: { $push: '$$ROOT' },
      },
    },

    {
      $addFields: {
        finalDisposition: {
          $cond: [
            { $in: ['ANSWERED', '$dispositions'] },
            'ANSWERED',
            {
              $cond: [
                { $in: ['NO ANSWER', '$dispositions'] },
                'NO ANSWER',
                {
                  $cond: [
                    { $in: ['BUSY', '$dispositions'] },
                    'BUSY',
                    'UNKNOWN',
                  ],
                },
              ],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        queues: {
          $filter: {
            input: '$queues',
            as: 'q',
            cond: { $ne: ['$$q', null] },
          },
        },
        firstQueue: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$queues',
                as: 'x',
                cond: { $ne: ['$$x', null] },
              },
            },
            0,
          ],
        },
      },
    },

    { $sort: { start: 1 } },
  ]);
}

export async function getQueueAnsweredList(
  models,
  startDate,
  endDate,
  queueId = '6500',
) {
  return await models.CallCdrs.aggregate([
    {
      $match: {
        start: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },

    {
      $addFields: {
        queue: {
          $cond: [
            { $regexMatch: { input: '$actionType', regex: /QUEUE\[/ } },
            {
              $arrayElemAt: [
                {
                  $split: [
                    {
                      $arrayElemAt: [{ $split: ['$actionType', 'QUEUE['] }, 1],
                    },
                    ']',
                  ],
                },
                0,
              ],
            },
            null,
          ],
        },
      },
    },

    {
      $match: {
        queue: queueId,
        disposition: { $eq: 'ANSWERED' },
        billsec: { $gte: 0 },
        lastapp: 'Queue',
      },
    },

    {
      $group: {
        _id: '$uniqueid',
        src: { $first: '$src' },
        dst: { $first: '$dst' },
        start: { $first: '$start' },
        end: { $max: '$end' },
        billsec: { $sum: '$billsec' },
        dispositions: { $addToSet: '$disposition' },
        cdrList: { $push: '$$ROOT' },
      },
    },

    {
      $match: { dispositions: 'ANSWERED' },
    },

    { $sort: { start: 1 } },
  ]);
}

export async function getQueueMissedList(
  models,
  startDate,
  endDate,
  queueId = '6501',
) {
  return await models.CallCdrs.aggregate([
    {
      $match: {
        start: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },

    {
      $addFields: {
        queue: {
          $cond: [
            { $regexMatch: { input: '$actionType', regex: /QUEUE\[/ } },
            {
              $arrayElemAt: [
                {
                  $split: [
                    {
                      $arrayElemAt: [{ $split: ['$actionType', 'QUEUE['] }, 1],
                    },
                    ']',
                  ],
                },
                0,
              ],
            },
            null,
          ],
        },
      },
    },

    { $match: { queue: queueId } },

    {
      $group: {
        _id: '$uniqueid',
        src: { $first: '$src' },
        dst: { $first: '$dst' },
        start: { $first: '$start' },
        end: { $max: '$end' },
        dispositions: { $addToSet: '$disposition' },
        billsec: { $max: '$billsec' },
        cdrList: { $push: '$$ROOT' },
      },
    },

    {
      $match: {
        $or: [
          { dispositions: { $nin: ['ANSWERED'] } },
          {
            dispositions: { $in: ['ANSWERED'] },
            billsec: { $eq: 0 },
          },
        ],
      },
    },

    { $sort: { start: 1 } },
  ]);
}
