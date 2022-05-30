import * as mongoose from 'mongoose';
import * as strip from 'strip';
import * as faker from 'faker';
import * as Random from 'meteor-random';
import { IUserDocument } from './types';
import { IPermissionDocument } from './definitions/permissions';

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  subdomain?: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return value || '';
};

/**
 * Returns user's name or email
 */
export const getUserDetail = (user: IUserDocument) => {
  return (user.details && user.details.fullName) || user.email;
};

export const paginate = (
  collection,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  }
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

  const result = val.map(char =>
    specialChars.includes(char) ? '.?\\' + char : '.?' + char
  );

  return '.*' + result.join('').substring(2) + '.*';
};

export const regexSearchText = (
  searchValue: string,
  searchKey = 'searchText'
) => {
  const result: any[] = [];

  searchValue = searchValue.replace(/\s\s+/g, ' ');

  const words = searchValue.split(' ');

  for (const word of words) {
    result.push({ [searchKey]: new RegExp(`${stringToRegex(word)}`, 'mui') });
  }

  return { $and: result };
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()): Date => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const getDate = (date: Date, day: number): Date => {
  const currentDate = new Date();

  date.setDate(currentDate.getDate() + day + 1);
  date.setHours(0, 0, 0, 0);

  return date;
};

export const getToday = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0
    )
  );
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
  newUserIds: string[] = []
) => {
  const removedUserIds = oldUserIds.filter(e => !newUserIds.includes(e));

  const addedUserIds = newUserIds.filter(e => !oldUserIds.includes(e));

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

export const getUniqueValue = async (
  collection: any,
  fieldName: string = 'code',
  defaultValue?: string
) => {
  const getRandomValue = (type: string) =>
    type === 'email' ? faker.internet.email().toLowerCase() : Random.id();

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

export interface ISendMessageArgs {
  subdomain: string;
  action: string;
  data;
  isRPC?: boolean;
  defaultValue?;
}

export const sendMessage = async (
  args: {
    client: any;
    serviceDiscovery: any;
    serviceName: string;
  } & ISendMessageArgs
): Promise<any> => {
  const {
    client,
    serviceDiscovery,
    serviceName,
    subdomain,
    action,
    data,
    defaultValue,
    isRPC
  } = args;

  if (serviceName) {
    if (!(await serviceDiscovery.isEnabled(serviceName))) {
      return defaultValue;
    }

    if (isRPC && !(await serviceDiscovery.isAvailable(serviceName))) {
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`${serviceName} service is not available`);
      } else {
        return defaultValue;
      }
    }
  }

  return client[isRPC ? 'sendRPCMessage' : 'sendMessage'](
    serviceName + (serviceName ? ':' : '') + action,
    { subdomain, data }
  );
};

interface IActionMap {
  [key: string]: boolean;
}

export const userActionsMap = async (
  userPermissions: IPermissionDocument[],
  groupPermissions: IPermissionDocument[],
  user: any
): Promise<IActionMap> => {
  const totalPermissions: IPermissionDocument[] = [
    ...userPermissions,
    ...groupPermissions,
    ...(user.customPermissions || [])
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

export const getSubdomain = (req): string => {
  const hostname = req.headers.hostname || req.hostname;
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};

export const createGenerateModels = <IModels>(models, loadClasses) => {
  return async (hostnameOrSubdomain: string): Promise<IModels> => {
    if (models) {
      return models;
    }

    const MONGO_URL = getEnv({ name: 'MONGO_URL' });

    const db = await mongoose.connect(MONGO_URL, connectionOptions);

    models = loadClasses(db, hostnameOrSubdomain);

    return models;
  };
};

export const authCookieOptions = (options = {}) => {
  const NODE_ENV = getEnv({ name: 'NODE_ENV' });
  const sevenDay = 7 * 24 * 3600 * 1000; // 7 day

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + sevenDay),
    maxAge: sevenDay,
    secure: !['test', 'development'].includes(NODE_ENV),
    ...options
  };

  return cookieOptions;
};
