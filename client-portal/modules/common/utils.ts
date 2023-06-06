import { Config } from '../types';
import { getEnv } from '../../utils/configs';
import { urlParser } from '../utils';

/**
 * Generate random string
 */
export const generateRandomString = (len: number = 10) => {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(position, position + 1);
  }

  return randomString;
};

export const isValidUsername = (username: string) => {
  const reg = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/gim;

  return reg.test(username);
};

const getSelector = (name: string) => {
  return document.querySelector(`[name='${name}']`) as any;
};

export const getValue = name => {
  const element = getSelector(name);

  if (element) {
    return element.value;
  }

  return '';
};

export const getConfigColor = (config: Config, key: string) => {
  if (!config.styles) {
    return null;
  }

  return config.styles[key];
};

/**
 * Request to get file's URL for view and download
 * @param {String} - value
 * @return {String} - URL
 */
export const readFile = (value: string): string => {
  if (!value || urlParser.isValidURL(value) || value.includes('/')) {
    return value;
  }

  const { REACT_APP_DOMAIN } = getEnv();

  if (REACT_APP_DOMAIN.includes('localhost')) {
    return `${REACT_APP_DOMAIN}/read-file?key=${value}`;
  }
  return `${REACT_APP_DOMAIN}/gateway/pl:core/read-file?key=${value}`;
};

export const reorder = (
  list: string[],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);

  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
