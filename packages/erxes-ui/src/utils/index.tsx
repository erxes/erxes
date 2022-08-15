import * as animations from './animations';
import * as calendar from './calendar';
import * as categories from './categories';
import * as core from './core';
import * as router from './router';

import uploadHandler, {
  deleteHandler as uploadDeleteHandler
} from './uploadHandler';

import Alert from './Alert';
import commonListComposer from './commonListComposer';
import confirm from './confirmation/confirm';
import parseMD from './parseMd';
import toggleCheckBoxes from './toggleCheckBoxes';
import urlParser from './urlParser';

export const loadCustomPlugin = core.loadCustomPlugin;
export const renderFullName = core.renderFullName;
export const renderUserFullName = core.renderUserFullName;
export const setTitle = core.setTitle;
export const setBadge = core.setBadge;
export const reorder = core.reorder;
export const generateRandomColorCode = core.generateRandomColorCode;
export const isTimeStamp = core.isTimeStamp;
export const range = core.range;
export const intersection = core.intersection;
export const union = core.union;
export const difference = core.difference;
export const can = core.can;
export const __ = core.__;
export const readFile = core.readFile;
export const getUserAvatar = core.getUserAvatar;
export const withProps = core.withProps;
export const renderWithProps = core.renderWithProps;
export const isValidDate = core.isValidDate;
export const extractAttachment = core.extractAttachment;
export const setCookie = core.setCookie;
export const getCookie = core.getCookie;
export const generateRandomString = core.generateRandomString;
export const getRandomNumber = core.getRandomNumber;
export const sendDesktopNotification = core.sendDesktopNotification;
export const roundToTwo = core.roundToTwo;
export const formatValue = core.formatValue;
export const isEmptyContent = core.isEmptyContent;
export const isValidUsername = core.isValidUsername;
export const storeConstantToStore = core.storeConstantToStore;
export const getConstantFromStore = core.getConstantFromStore;
export const bustIframe = core.bustIframe;
export const getEnv = core.getEnv;
export const cleanIntegrationKind = core.cleanIntegrationKind;
export const getConfig = core.getConfig;
export const setConfig = core.setConfig;
export const generateCategoryOptions = categories.generateCategoryOptions;
export const generateTree = core.generateTree;
export const removeTypename = core.removeTypename;

export {
  animations,
  calendar,
  parseMD,
  Alert,
  uploadHandler,
  uploadDeleteHandler,
  router,
  confirm,
  toggleCheckBoxes,
  urlParser,
  categories,
  commonListComposer
};
