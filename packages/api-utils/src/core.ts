import { IUserDocument } from '@erxes/common-types';

export const getEnv = ({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  return value || '';
};

export const getConfigs = async (models, memoryStorage) => {
  const configsCache = await memoryStorage().get('configs_erxes_api');

  if (configsCache && configsCache !== '{}') {
    return JSON.parse(configsCache);
  }

  const configsMap = {};
  const configs = await models.Configs.find({});

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  memoryStorage().set('configs_erxes_api', JSON.stringify(configsMap));

  return configsMap;
};

export const getConfig = async (models, memoryStorage, code, defaultValue?) => {
  const configs = await getConfigs(models, memoryStorage);

  if (!configs[code]) {
    return defaultValue;
  }

  return configs[code];
};

export const resetConfigsCache = (memoryStorage) => {
  memoryStorage().set('configs_erxes_api', '');
};

export const frontendEnv = ({
  name,
  req,
  requestInfo,
}: {
  name: string;
  req?: any;
  requestInfo?: any;
}): string => {
  const cookies = req ? req.cookies : requestInfo.cookies;
  const keys = Object.keys(cookies);

  const envs: { [key: string]: string } = {};

  for (const key of keys) {
    envs[key.replace('REACT_APP_', '')] = cookies[key];
  }

  return envs[name];
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

  const result = val.map((char) =>
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
