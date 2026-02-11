import * as mongoose from 'mongoose';
import * as moment from 'moment'
import * as strip from 'strip';
import { IUserDocument } from './types';
import { IPermissionDocument } from './definitions/permissions';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import * as messageBroker from './messageBroker';
import type { InterMessage } from './messageBroker';
import { connect } from './mongo-connection';
import { coreModelOrganizations, getCoreConnection } from './saas/saas';

export const getEnv = ({
  name,
  defaultValue,
  subdomain,
}: {
  name: string;
  defaultValue?: string;
  subdomain?: string;
}): string => {
  let value = process.env[name] || '';

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (subdomain) {
    value = value.replace('<subdomain>', subdomain);
  }

  return value || '';
};

/**
 * Returns user's name  or email
 */
export const getUserDetail = (user: IUserDocument) => {
  if (user.details) {
    return `${user.details.firstName} ${user.details.lastName}`;
  }

  return user.email;
};

export const paginate = (
  collection,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  },
) => {
  const { page = 0, perPage = 0, ids, excludeIds } = params || { ids: null };

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

export const validSearchText = (values: string[]) => {
  const value = values.join(' ');

  if (value.length < 512) {
    return value;
  }

  return value.substring(0, 511);
};

const stringToRegex = (value: string) => {
  const specialChars = '{}[]\\^$.|?*+()'.split('');
  const val = value.split('');

  const result = val.map((char) =>
    specialChars.includes(char) ? '.?\\' + char : '.?' + char,
  );

  return '.*' + result.join('').substring(2) + '.*';
};

export const regexSearchText = (
  searchValue: string,
  searchKey = 'searchText',
) => {
  const result: any[] = [];

  searchValue = searchValue.replace(/\s\s+/g, ' ');

  const words = searchValue.split(' ');

  for (const word of words) {
    result.push({
      [searchKey]: { $regex: `${stringToRegex(word)}`, $options: 'mui' },
    });
  }

  return { $and: result };
};

export const fixNum = (value: any, p = 4) => {
  const cleanNumber = Number((value ?? '').toString().replace(/,/g, ""));

  if (isNaN(cleanNumber)) {
    return 0;
  }
  const multiplier = 10 ** p;

  const big = Math.round(
    Number((cleanNumber * multiplier).toFixed(2))
  );

  return Number((big / multiplier).toFixed(p))
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */

export const fixDate = (value: string | Date, defaultValue = new Date()): Date => {
  if (!value) return defaultValue;

  const date = new Date(value);
  if (isNaN(date.getTime())) return defaultValue;

  return new Date(date.getTime() - 8 * 60 * 60 * 1000);
};


export const getDate = (date: Date, day: number): Date => {
  const currentDate = new Date();

  date.setDate(currentDate.getDate() + day + 1);
  date.setHours(0, 0, 0, 0);

  return date;
};

export const getToday = (date: Date): Date => {
  return getFullDate(date)
};

export const getFullDate = (date: Date) => {
  return new Date(moment(date).format('YYYY-MM-DD'));
};

export const getPureDate = (date: Date, multiplier = 1) => {
  const ndate = new Date(date);
  const diffTimeZone =
    multiplier * Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getTomorrow = (date: Date) => {
  return new Date(moment(date).add(1, 'day').format('YYYY-MM-DD'))
};

export const getNextMonth = (date: Date): { start: number; end: number } => {
  const today = getToday(date);
  const currentMonth = new Date().getMonth();

  if (currentMonth === 11) {
    today.setFullYear(today.getFullYear() + 1);
  }

  const month = (currentMonth + 1) % 12;
  const start = today.setMonth(month, 1);
  const end = today.setMonth(month + 1, 0);

  return { start, end };
};

/**
 * Check user ids whether its added or removed from array of ids
 */
export const checkUserIds = (
  oldUserIds: string[] = [],
  newUserIds: string[] = [],
) => {
  const removedUserIds = oldUserIds.filter((e) => !newUserIds.includes(e));

  const addedUserIds = newUserIds.filter((e) => !oldUserIds.includes(e));

  return { addedUserIds, removedUserIds };
};

export const chunkArray = (myArray, chunkSize: number) => {
  let index = 0;

  const arrayLength = myArray.length;
  const tempArray: any[] = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    const myChunk = myArray.slice(index, index + chunkSize);

    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
};

export const cleanHtml = (content?: string) =>
  strip(content || '').substring(0, 100);

/**
 * Splits text into chunks of strings limited by given character count
 * .{1,100}(\s|$)
 * . - matches any character (except for line terminators)
 * {1,100} - matches the previous token between 1 and 100 times, as many times as possible, giving back as needed (greedy)
 * (\s|$) - capturing group
 * \s - matches any whitespace character
 * $ - asserts position at the end of the string
 *
 * @param str text to be split
 * @param size character length of each chunk
 */
export const splitStr = (str: string, size: number): string[] => {
  const cleanStr = strip(str);

  return cleanStr.match(new RegExp(new RegExp(`.{1,${size}}(\s|$)`, 'g')));
};

const generateRandomEmail = () => {
  let chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let string = '';
  for (let ii = 0; ii < 15; ii++) {
    string += chars[Math.floor(Math.random() * chars.length)];
  }

  return string + '@gmail.com';
};

export const getUniqueValue = async (
  collection: any,
  fieldName: string = 'code',
  defaultValue?: string,
) => {
  const getRandomValue = (type: string) =>
    type === 'email' ? generateRandomEmail() : randomAlphanumeric();

  let uniqueValue = defaultValue || getRandomValue(fieldName);

  let duplicated = await collection.findOne({ [fieldName]: uniqueValue });

  while (duplicated) {
    uniqueValue = getRandomValue(fieldName);

    duplicated = await collection.findOne({ [fieldName]: uniqueValue });
  }

  return uniqueValue;
};

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export interface MessageArgs extends MessageArgsOmitService {
  serviceName: string;
}

export interface MessageArgsOmitService extends InterMessage {
  action: string;
  isRPC?: boolean;
  isMQ?: boolean;
}

export const sendMessage = async (args: MessageArgs): Promise<any> => {
  const {
    serviceName,
    subdomain,
    action,
    data,
    defaultValue,
    isRPC,
    isMQ,
    timeout,
  } = args;

  if (serviceName && !(await isEnabled(serviceName))) {
    if (isRPC && defaultValue === undefined) {
      throw new Error(`${serviceName} service is not enabled`);
    } else {
      return defaultValue;
    }
  }

  const queueName = serviceName + (serviceName ? ':' : '') + action;

  return messageBroker[
    isRPC ? (isMQ ? 'sendRPCMessageMq' : 'sendRPCMessage') : 'sendMessage'
  ](queueName, {
    subdomain,
    data,
    defaultValue,
    timeout,
    thirdService: data && data.thirdService,
  });
};

interface IActionMap {
  [key: string]: boolean;
}

export const userActionsMap = async (
  userPermissions: IPermissionDocument[],
  groupPermissions: IPermissionDocument[],
  user: any,
): Promise<IActionMap> => {
  const totalPermissions: IPermissionDocument[] = [
    ...userPermissions,
    ...groupPermissions,
    ...(user.customPermissions || []),
  ];
  const allowedActions: IActionMap = {};

  const check = (name: string, allowed: boolean) => {
    if (typeof allowedActions[name] === 'undefined') {
      allowedActions[name] = allowed;
    }

    // if a specific permission is denied elsewhere, follow that rule
    if (allowedActions[name] && !allowed) {
      allowedActions[name] = false;
    }
  };

  for (const { requiredActions, allowed, action } of totalPermissions) {
    if (requiredActions.length > 0) {
      for (const actionName of requiredActions) {
        check(actionName, allowed);
      }
    } else {
      check(action, allowed);
    }
  }

  return allowedActions;
};

/*
 * Generate url depending on given file upload publicly or not
 */
export const generateAttachmentUrl = (urlOrName: string) => {
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (urlOrName.startsWith('http')) {
    return urlOrName;
  }

  return `${DOMAIN}/gateway/pl:core/read-file?key=${urlOrName}`;
};

export const getSubdomain = (req): string => {
  const hostname =
    req.headers['nginx-hostname'] || req.headers.hostname || req.hostname;
  const subdomain = hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
  return subdomain;
};

export const connectionOptions: mongoose.ConnectOptions = {
  family: 4,
};

export const createGenerateModels = <IModels>(
  loadClasses: (
    db: mongoose.Connection,
    subdomain: string,
  ) => IModels | Promise<IModels>,
): ((hostnameOrSubdomain: string) => Promise<IModels>) => {
  const VERSION = getEnv({ name: 'VERSION' });

  connect();

  if (VERSION && VERSION !== 'saas') {
    let models: IModels | null = null;
    return async function genereteModels(
      hostnameOrSubdomain: string,
    ): Promise<IModels> {
      if (models) {
        return models;
      }

      models = await loadClasses(mongoose.connection, hostnameOrSubdomain);

      return models;
    };
  } else {
    return async function genereteModels(
      hostnameOrSubdomain: string = '',
    ): Promise<IModels> {
      let subdomain: string = hostnameOrSubdomain;

      if (!subdomain) {
        throw new Error(`Subdomain is \`${subdomain}\``);
      }

      // means hostname
      if (subdomain && subdomain.includes('.')) {
        subdomain = getSubdomain(hostnameOrSubdomain);
      }

      await getCoreConnection();

      const organization = await coreModelOrganizations.findOne({ subdomain });

      if (!organization) {
        throw new Error(
          `Organization with subdomain = ${subdomain} is not found`,
        );
      }

      const DB_NAME = getEnv({ name: 'DB_NAME' });
      const GE_MONGO_URL = (DB_NAME || 'erxes_<organizationId>').replace(
        '<organizationId>',
        organization._id,
      );

      // @ts-ignore
      const tenantCon = mongoose.connection.useDb(GE_MONGO_URL, {
        // so that conn.model method can use cached connection
        useCache: true,
        noListener: true,
      });

      return await loadClasses(tenantCon, subdomain);
    };
  }
};

export const authCookieOptions = (options: any = {}) => {
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const maxAge = options.expires || 14 * 24 * 60 * 60 * 1000;

  const secure = !['test', 'development'].includes(NODE_ENV);

  if (!secure && options.sameSite) {
    delete options.sameSite;
  }

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + maxAge),
    maxAge,
    secure,
    ...options,
  };

  return cookieOptions;
};

export const stripHtml = (string: any) => {
  if (typeof string === 'undefined' || string === null) {
    return;
  } else {
    const regex = /(&nbsp;|<([^>]+)>)/gi;
    let result = string.replace(regex, '');
    result = result.replace(/&#[0-9][0-9][0-9][0-9];/gi, ' ');
    const cut = result.slice(0, 70);
    return cut;
  }
};

const DATE_OPTIONS = {
  d: 1000 * 60 * 60 * 24,
  h: 1000 * 60 * 60,
  m: 1000 * 60,
  s: 1000,
  ms: 1,
};

const CHARACTERS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@#$%^&*()-=+{}[]<>.,:;"`|/?';

const BEGIN_DIFF = 1577836800000; // new Date('2020-01-01').getTime();

export const dateToShortStr = (
  date?: Date | string | number,
  scale?: 10 | 16 | 62 | 92 | number,
  kind?: 'd' | 'h' | 'm' | 's' | 'ms',
) => {
  date = new Date(date || new Date());

  if (!scale) {
    scale = 62;
  }
  if (!kind) {
    kind = 'd';
  }

  const divider = DATE_OPTIONS[kind];
  const chars = CHARACTERS.substring(0, scale);

  let intgr = Math.round((date.getTime() - BEGIN_DIFF) / divider);

  let short = '';

  while (intgr > 0) {
    const preInt = intgr;
    intgr = Math.floor(intgr / scale);
    const strInd = preInt - intgr * scale;
    short = `${chars[strInd]}${short}`;
  }

  return short;
};

export const shortStrToDate = (
  shortStr: string,
  scale?: 10 | 16 | 62 | 92 | number,
  kind?: 'd' | 'h' | 'm' | 's' | 'ms',
  resultType?: 'd' | 'n',
) => {
  if (!shortStr) return;

  if (!scale) {
    scale = 62;
  }
  if (!kind) {
    kind = 'd';
  }
  const chars = CHARACTERS.substring(0, scale);
  const multiplier = DATE_OPTIONS[kind];

  let intgr = 0;
  let scaler = 1;

  for (let i = shortStr.length; i--; i >= 0) {
    const char = shortStr[i];
    intgr = intgr + scaler * chars.indexOf(char);
    scaler = scaler * scale;
  }

  intgr = intgr * multiplier + BEGIN_DIFF;

  if (resultType === 'd') return new Date(intgr);

  return intgr;
};
