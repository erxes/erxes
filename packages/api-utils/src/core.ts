import * as mongoose from 'mongoose';
import * as strip from 'strip';
import { IUserDocument } from './types';
import { IPermissionDocument } from './definitions/permissions';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import * as messageBroker from './messageBroker';
import type { InterMessage } from './messageBroker';
import {
  addonSchema,
  endPointSchema,
  installationSchema,
  organizationsSchema,
  promoCodeSchema,
  userSchema,
  pluginSchema,
  experiencesSchema,
  bundleSchema,
} from './definitions/saas-core';
import { IOrganization } from './saas/constants';

import redis from './redis';

export const removeOrgsCache = (source: string) => {
  console.log(`Removing org cache ${source}`);

  return redis.set('core_organizations', '');
};

export const getEnv = ({
  name,
  defaultValue,
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
      0,
    ),
  );
};

export const getPureDate = (date: Date, multiplier = 1) => {
  const ndate = new Date(date);
  const diffTimeZone =
    multiplier * Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

export const getTomorrow = (date: Date) => {
  return getToday(new Date(date.getTime() + 24 * 60 * 60 * 1000));
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
  const hostname = req.headers.hostname || req.hostname;
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

export const connectionOptions: mongoose.ConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4,
};

export let coreModelOrganizations;
export let coreModelAddons;
export let coreModelBundles;
export let coreModelInstallations;
export let coreModelUsers;
export let coreModelEndpoints;
export let coreModelPromoCodes;
export let coreModelPlugins;
export let coreModelExperiences;

export const getCoreConnection = async (): Promise<void> => {
  if (coreModelOrganizations) {
    return;
  }

  const CORE_MONGO_URL = getEnv({ name: 'CORE_MONGO_URL' });

  const coreConnection = await mongoose.createConnection(
    CORE_MONGO_URL,
    connectionOptions,
  );

  coreModelOrganizations = coreConnection.model(
    'organizations',
    organizationsSchema,
  );

  coreModelInstallations = coreConnection.model(
    'installations',
    installationSchema,
  );
  coreModelExperiences = coreConnection.model('experiences', experiencesSchema);
  coreModelUsers = coreConnection.model('users', userSchema);
  coreModelEndpoints = coreConnection.model('endpoints', endPointSchema);
  coreModelPromoCodes = coreConnection.model('promo_codes', promoCodeSchema);
  coreModelAddons = coreConnection.model('addons', addonSchema);
  coreModelBundles = coreConnection.model('bundles', bundleSchema);
  coreModelPlugins = coreConnection.model('plugins', pluginSchema);
};

export const createGenerateModels = <IModels>(models, loadClasses) => {
  const MONGO_URL = getEnv({ name: 'MONGO_URL' });

  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION !== 'saas') {
    return async (hostnameOrSubdomain: string): Promise<IModels> => {
      if (models) {
        return models;
      }

      const MONGO_URL = getEnv({ name: 'MONGO_URL' });

      const db = await mongoose.connect(MONGO_URL, connectionOptions);

      models = loadClasses(db, hostnameOrSubdomain);

      return models;
    };
  } else {
    return async (hostnameOrSubdomain: string = ''): Promise<IModels> => {
      let subdomain: string = hostnameOrSubdomain;

      // means hostname
      if (subdomain && subdomain.includes('.')) {
        subdomain = getSubdomain(hostnameOrSubdomain);
      }

      await getCoreConnection();

      const organization = await coreModelOrganizations.findOne({ subdomain });

      if (!organization) return models;

      const DB_NAME = getEnv({ name: 'DB_NAME' });
      const GE_MONGO_URL = (DB_NAME || 'erxes_<organizationId>').replace(
        '<organizationId>',
        organization._id,
      );

      // @ts-ignore
      const tenantCon = mongoose.connection.useDb(GE_MONGO_URL, {
        // so that conn.model method can use cache
        useCache: true,
        noListener: true,
      });

      models = await loadClasses(tenantCon, subdomain);

      return models;
    };
  }
};

export const getOrganizations = async (email?: string) => {
  await getCoreConnection();

  if (email) {
    return coreModelOrganizations.find({ ownerEmail: email });
  }

  return coreModelOrganizations.find({});
};

export let ORGANIZATION_ID_MAPPING: { [key: string]: string } = {};

export const getOrganizationIdBySubdomain = async (
  subdomain: string,
): Promise<string> => {
  if (ORGANIZATION_ID_MAPPING[subdomain]) {
    return ORGANIZATION_ID_MAPPING[subdomain];
  }

  await getCoreConnection();

  const organization = await getOrgsCache({ subdomain });

  if (!organization) {
    throw new Error(`Invalid host, subdomain: ${subdomain}`);
  }

  ORGANIZATION_ID_MAPPING[subdomain] = organization._id;

  return ORGANIZATION_ID_MAPPING[subdomain];
};

export const getOrgsCache = async ({
  subdomain,
  excludeSubdomains,
  domain,
}: {
  subdomain?: string;
  excludeSubdomains?: string[];
  domain?: string;
}): Promise<any> => {
  const value = await redis.get('core_organizations');

  let organizations: IOrganization[] = value ? JSON.parse(value) : [];

  if (organizations.length === 0) {
    console.log('Fetching organizations from database ...');

    organizations = await coreModelOrganizations.find({}).lean();

    redis.set('core_organizations', JSON.stringify(organizations));
  }

  if (subdomain) {
    return organizations.find((org) => org.subdomain === subdomain);
  }

  if (excludeSubdomains) {
    return organizations.filter(
      (org) => !excludeSubdomains.includes(org.subdomain),
    );
  }

  if (domain) {
    return organizations.find((org) => org.domain === domain);
  }

  return organizations;
};

export const getOrganizationDetail = async ({
  subdomain,
}: {
  subdomain: string;
  models?: any;
}) => {
  await getCoreConnection();

  const organization = await coreModelOrganizations
    .findOne({ subdomain })
    .lean();

  if (!organization) {
    return {};
  }

  const charge = organization.charge || {};
  let experienceName = '';
  let bundleNames = [] as string[];

  const installation = await coreModelInstallations.findOne({
    organizationId: organization._id,
  });

  const setupService = {};

  if (installation) {
    const plugins = await getPlugins({});
    const addons = await coreModelAddons.find(
      {
        installationId: installation._id.toString(),
        expiryDate: { $gt: new Date() },
        paymentStatus: { $in: ['complete', 'canceled'] },
      },
      { quantity: 1, kind: 1 },
    );

    const bundleTypes = await coreModelBundles.find({}).distinct('type').lean();

    const activeBundles = await coreModelAddons
      .find({
        installationId: installation._id.toString(),
        kind: { $in: bundleTypes },
        paymentStatus: { $in: ['complete', 'canceled'] },
        expiryDate: { $gt: new Date() },
      })
      .lean();

    for (const activeBundle of activeBundles) {
      const bundle = await coreModelBundles.findOne({
        type: activeBundle.kind,
      });

      bundleNames.push(bundle.title);
    }

    for (const plugin of plugins) {
      let purchased = 0;
      let quantity = 0;
      let free = charge[plugin.type] ? charge[plugin.type].free || 0 : 0;
      let bundleAmount = 0;

      if (activeBundles && activeBundles.length > 0) {
        for (const activeBundle of activeBundles) {
          const bundle = await coreModelBundles.findOne({
            type: activeBundle.kind,
          });

          if (bundle) {
            bundleAmount = bundle.pluginLimits
              ? bundle.pluginLimits[plugin.type] || 0
              : 0;
          }
        }
      }

      addons
        .filter((addon) => addon.kind === plugin.type)
        .forEach((addon) => {
          quantity += addon.quantity || 0;
        });

      if (organization && organization.experienceId) {
        const experience = await coreModelExperiences.findOne({
          _id: organization.experienceId,
        });

        if (experience) {
          experienceName = experience.title;
          free =
            free +
            (experience.pluginLimits
              ? experience.pluginLimits[plugin.type] || 0
              : 0);
        }
      }

      purchased = quantity + (bundleAmount || 0) / (plugin.count || 1);

      charge[plugin.type] = {
        ...charge[plugin.type],
        free,
        purchased,
      };
    }

    const setupAddons = await coreModelAddons.find(
      {
        installationId: installation._id.toString(),
        paymentStatus: 'complete',
        kind: 'setupService',
      },
      { subkind: 1 },
    );

    for (const addon of setupAddons) {
      setupService[addon.subkind] = true;
    }
  }

  return {
    ...organization,
    experienceName,
    bundleNames,
    charge,
    setupService,
  };
};

export const getPlugins = async (query: any = {}) => {
  await getCoreConnection();

  return coreModelPlugins.find(query).lean();
};

export const getPlugin = async (query: any = {}) => {
  await getCoreConnection();

  return coreModelPlugins.findOne(query).lean();
};

export const getPromoCodes = async (query: any = {}) => {
  await getCoreConnection();

  return coreModelPromoCodes.find(query).lean();
};

export const getOrgPromoCodes = async ({ promoCodes = [] }: IOrganization) => {
  if (!promoCodes.length) {
    return [];
  }

  return getPromoCodes({
    code: { $in: promoCodes },
  });
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
