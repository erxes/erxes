import * as moment from 'moment';
import { debugError } from '@erxes/api-utils/src/debuggers';
import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import redis from '@erxes/api-utils/src/redis';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { getNextMonth, getToday } from '@erxes/api-utils/src';
import { IUserDocument } from './../../api-utils/src/types';
import { graphqlPubsub } from './configs';
import { generateModels, IContext, IModels } from './connectionResolver';
import {
  sendCoreMessage,
  sendCommonMessage,
  sendContactsMessage,
  sendCardsMessage
} from './messageBroker';

import * as admin from 'firebase-admin';
import { CLOSE_DATE_TYPES } from './constants';

export const getConfig = async (
  code: string,
  subdomain: string,
  defaultValue?: string
) => {
  const configs = await sendCoreMessage({
    subdomain,
    action: 'getConfigs',
    data: {},
    isRPC: true,
    defaultValue: []
  });

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { ClientPortalUsers } = models;

  const schema = ClientPortalUsers.schema as any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  return fields;
};

export const sendSms = async (
  subdomain: string,
  type: string,
  phoneNumber: string,
  content: string
) => {
  switch (type) {
    case 'messagePro':
      const MESSAGE_PRO_API_KEY = await getConfig(
        'MESSAGE_PRO_API_KEY',
        subdomain,
        ''
      );

      const MESSAGE_PRO_PHONE_NUMBER = await getConfig(
        'MESSAGE_PRO_PHONE_NUMBER',
        subdomain,
        ''
      );

      if (!MESSAGE_PRO_API_KEY || !MESSAGE_PRO_PHONE_NUMBER) {
        throw new Error('messaging config not set properly');
      }

      try {
        await sendRequest({
          url: 'https://api.messagepro.mn/send',
          method: 'GET',
          params: {
            key: MESSAGE_PRO_API_KEY,
            from: MESSAGE_PRO_PHONE_NUMBER,
            to: phoneNumber,
            text: content
          }
        });

        return 'sent';
      } catch (e) {
        debugError(e.message);
        throw new Error(e.message);
      }

    default:
      break;
  }
};

export const generateRandomPassword = (len: number = 10) => {
  const specials = '!@#$%^&*()_+{}:"<>?|[];\',./`~';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const pick = (
    exclusions: string,
    string: string,
    min: number,
    max: number
  ) => {
    let n;
    let chars = '';

    if (max === undefined) {
      n = min;
    } else {
      n = min + Math.floor(Math.random() * (max - min + 1));
    }

    let i = 0;
    while (i < n) {
      const character = string.charAt(
        Math.floor(Math.random() * string.length)
      );
      if (exclusions.indexOf(character) < 0 && chars.indexOf(character) < 0) {
        chars += character;
        i++;
      }
    }

    return chars;
  };

  const shuffle = (string: string) => {
    const array = string.split('');
    let tmp;
    let current;
    let top = array.length;

    if (top) {
      while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }

      return array.join('');
    }
  };

  let password = '';

  password += pick(password, specials, 1, 1);
  password += pick(password, lowercase, 2, 3);
  password += pick(password, uppercase, 2, 3);
  password += pick(password, numbers, 3, 3);

  return shuffle(password);
};

export const initFirebase = async (subdomain: string): Promise<void> => {
  const config = await sendCoreMessage({
    subdomain,
    action: 'configs.findOne',
    data: {
      query: {
        code: 'GOOGLE_APPLICATION_CREDENTIALS_JSON'
      }
    },
    isRPC: true,
    defaultValue: null
  });

  if (!config) {
    return;
  }

  const codeString = config.value || 'value';

  if (codeString[0] === '{' && codeString[codeString.length - 1] === '}') {
    const serviceAccount = JSON.parse(codeString);

    if (serviceAccount.private_key) {
      await admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  }
};

interface ISendNotification {
  receivers: string[];
  title: string;
  content: string;
  notifType: 'system' | 'engage';
  link: string;
  createdUser?: IUserDocument;
  isMobile?: boolean;
  eventData?: any | null;
}

export const sendNotification = async (
  models: IModels,
  subdomain: string,
  doc: ISendNotification
) => {
  const {
    createdUser,
    receivers,
    title,
    content,
    notifType,
    isMobile,
    eventData
  } = doc;

  const link = doc.link;

  // remove duplicated ids
  const receiverIds = [...Array.from(new Set(receivers))];

  // collecting emails
  const recipients = await models.ClientPortalUsers.find({
    _id: { $in: receiverIds }
  }).lean();

  // collect recipient emails
  const toEmails: string[] = [];

  for (const recipient of recipients) {
    if (
      recipient.notificationSettings &&
      recipient.notificationSettings.receiveByEmail &&
      recipient.email
    ) {
      toEmails.push(recipient.email);
    }

    const notification = await models.ClientPortalNotifications.createNotification(
      {
        title,
        content,
        link,
        receiver: recipient._id,
        notifType,
        clientPortalId: recipient.clientPortalId,
        eventData
      },
      createdUser && createdUser._id
    );

    graphqlPubsub.publish('clientPortalNotificationInserted', {
      clientPortalNotificationInserted: {
        _id: notification._id,
        userId: recipient._id,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        eventData
      }
    });
  }

  sendCoreMessage({
    subdomain,
    action: 'sendEmail',
    data: {
      toEmails,
      title: 'Notification',
      template: {
        name: 'notification',
        data: {
          notification: { ...doc, link }
        }
      },
      modifier: (data: any, email: string) => {
        const user = recipients.find(item => item.email === email);

        if (user) {
          data.uid = user._id;
        }
      }
    }
  });

  if (isMobile) {
    if (!admin.apps.length) {
      await initFirebase(subdomain);
    }
    const transporter = admin.messaging();
    const deviceTokens: string[] = [];

    for (const recipient of recipients) {
      if (recipient.deviceTokens) {
        deviceTokens.push(...recipient.deviceTokens);
      }
    }

    const expiredTokens = [''];
    for (const token of deviceTokens) {
      try {
        await transporter.send({
          token,
          notification: { title, body: content },
          data: eventData || {}
        });
      } catch (e) {
        debugError(`Error occurred during firebase send: ${e.message}`);
        expiredTokens.push(token);
      }
    }

    if (expiredTokens.length > 0) {
      await models.ClientPortalUsers.updateMany(
        {},
        { $pull: { deviceTokens: { $in: expiredTokens } } }
      );
    }
  }
};

export const customFieldsDataByFieldCode = async (object, subdomain) => {
  const customFieldsData =
    object.customFieldsData && object.customFieldsData.toObject
      ? object.customFieldsData.toObject()
      : object.customFieldsData || [];

  const fieldIds = customFieldsData.map(data => data.field);

  const fields = await sendCommonMessage({
    serviceName: 'forms',
    subdomain,
    action: 'fields.find',
    data: {
      query: {
        _id: { $in: fieldIds }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  const fieldCodesById = {};

  for (const field of fields) {
    fieldCodesById[field._id] = field.code;
  }

  const results: any = {};

  for (const data of customFieldsData) {
    results[fieldCodesById[data.field]] = {
      ...data
    };
  }

  return results;
};

export const sendAfterMutation = async (
  subdomain: string,
  type: string,
  action: string,
  object: any,
  newData: any,
  extraDesc: any
) => {
  const value = await redis.get('afterMutations');
  const afterMutations = JSON.parse(value || '{}');

  if (
    afterMutations[type] &&
    afterMutations[type][action] &&
    afterMutations[type][action].length
  ) {
    for (const service of afterMutations[type][action]) {
      sendCommonMessage({
        serviceName: service,
        subdomain,
        action: 'afterMutation',
        data: {
          type,
          action,
          object,
          newData,
          extraDesc
        }
      });
    }
  }
};

export const getCards = async (
  type: 'ticket' | 'deal' | 'task' | 'purchase',
  context: IContext,
  args: any
) => {
  const { subdomain, models, cpUser } = context;
  if (!cpUser) {
    throw new Error('Login required');
  }

  const cp = await models.ClientPortals.getConfig(cpUser.clientPortalId);

  const pipelineId = cp[type + 'PipelineId'];

  if (!pipelineId || pipelineId.length === 0) {
    return [];
  }

  const customer = await sendContactsMessage({
    subdomain,
    action: 'customers.findOne',
    data: {
      _id: cpUser.erxesCustomerId
    },
    isRPC: true
  });

  if (!customer) {
    return [];
  }

  const conformities = await sendCoreMessage({
    subdomain,
    action: 'conformities.getConformities',
    data: {
      mainType: 'customer',
      mainTypeIds: [customer._id],
      relTypes: [type]
    },
    isRPC: true,
    defaultValue: []
  });

  if (conformities.length === 0) {
    return [];
  }

  const cardIds: string[] = [];

  for (const c of conformities) {
    if (c.relType === type && c.mainType === 'customer') {
      cardIds.push(c.relTypeId);
    }

    if (c.mainType === type && c.relType === 'customer') {
      cardIds.push(c.mainTypeId);
    }
  }

  const stages = await sendCardsMessage({
    subdomain,
    action: 'stages.find',
    data: {
      pipelineId
    },
    isRPC: true,
    defaultValue: []
  });

  if (stages.length === 0) {
    return [];
  }

  const stageIds = stages.map(stage => stage._id);

  let oneStageId = '';
  if (args.stageId) {
    if (stageIds.includes(args.stageId)) {
      oneStageId = args.stageId;
    } else {
      oneStageId = 'noneId';
    }
  }

  return sendCardsMessage({
    subdomain,
    action: `${type}s.find`,
    data: {
      _id: { $in: cardIds },
      status: { $regex: '^((?!archived).)*$', $options: 'i' },
      stageId: oneStageId ? oneStageId : { $in: stageIds },
      ...(args?.priority && { priority: { $in: args?.priority || [] } }),
      ...(args?.labelIds && { labelIds: { $in: args?.labelIds || [] } }),
      ...(args?.closeDateType && {
        closeDate: getCloseDateByType(args.closeDateType)
      }),
      ...(args?.userIds && { assignedUserIds: { $in: args?.userIds || [] } })
    },
    isRPC: true,
    defaultValue: []
  });
};

export const getCloseDateByType = (closeDateType: string) => {
  if (closeDateType === CLOSE_DATE_TYPES.NEXT_DAY) {
    const tommorrow = moment().add(1, 'days');

    return {
      $gte: new Date(tommorrow.startOf('day').toISOString()),
      $lte: new Date(tommorrow.endOf('day').toISOString())
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_WEEK) {
    const monday = moment()
      .day(1 + 7)
      .format('YYYY-MM-DD');
    const nextSunday = moment()
      .day(7 + 7)
      .format('YYYY-MM-DD');

    return {
      $gte: new Date(monday),
      $lte: new Date(nextSunday)
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_MONTH) {
    const now = new Date();
    const { start, end } = getNextMonth(now);

    return {
      $gte: new Date(start),
      $lte: new Date(end)
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NO_CLOSE_DATE) {
    return { $exists: false };
  }

  if (closeDateType === CLOSE_DATE_TYPES.OVERDUE) {
    const now = new Date();
    const today = getToday(now);

    return { $lt: today };
  }
};
