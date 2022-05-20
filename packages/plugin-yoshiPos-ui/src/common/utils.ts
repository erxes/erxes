import T from 'i18n-react';

import {
  Alert,
  bustIframe,
  can,
  confirm,
  difference,
  extractAttachment,
  formatValue,
  generateRandomColorCode,
  generateRandomString,
  getConstantFromStore,
  getCookie,
  getEnv,
  getRandomNumber,
  getUserAvatar,
  intersection,
  isEmptyContent,
  isTimeStamp,
  isValidDate,
  isValidUsername,
  range,
  readFile,
  renderFullName,
  renderUserFullName,
  renderWithProps,
  reorder,
  roundToTwo,
  router,
  sendDesktopNotification,
  setBadge,
  setCookie,
  setTitle,
  storeConstantToStore,
  toggleCheckBoxes,
  union,
  uploadHandler,
  urlParser,
  withProps
} from 'erxes-ui/lib/utils';

const __ = (key: string, options?: any) => {
  const translation = T.translate(key, options);

  if (!translation) {
    return '';
  }

  return translation.toString();
};

export {
  Alert,
  getEnv,
  uploadHandler,
  router,
  confirm,
  toggleCheckBoxes,
  urlParser,
  renderFullName,
  renderUserFullName,
  setTitle,
  setBadge,
  reorder,
  generateRandomColorCode,
  isTimeStamp,
  range,
  intersection,
  union,
  difference,
  can,
  __,
  readFile,
  getUserAvatar,
  isValidDate,
  extractAttachment,
  setCookie,
  getCookie,
  generateRandomString,
  getRandomNumber,
  sendDesktopNotification,
  roundToTwo,
  isValidUsername,
  storeConstantToStore,
  getConstantFromStore,
  bustIframe,
  withProps,
  renderWithProps,
  formatValue,
  isEmptyContent
};
