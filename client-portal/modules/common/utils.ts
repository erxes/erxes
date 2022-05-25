import { Config } from "../types";
import { urlParser } from "../utils";
import { getEnv } from "../../utils/configs";

/**
 * Generate random string
 */
export const generateRandomString = (len: number = 10) => {
  const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  let randomString = "";

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

export const getValue = (name) => {
  const element = getSelector(name);

  if (element) {
    return element.value;
  }

  return "";
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
  if (!value || urlParser.isValidURL(value) || value.includes("/")) {
    return value;
  }

  const { REACT_APP_MAIN_API_DOMAIN } = getEnv();

  return `${REACT_APP_MAIN_API_DOMAIN}/read-file?key=${value}`;
};
