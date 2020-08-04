import { getEnv } from 'apolloClient';
import dayjs from 'dayjs';
import T from 'i18n-react';
import { IUser, IUserDoc } from 'modules/auth/types';
import React from 'react';
import Tip from '../components/Tip';
import { Limited } from '../styles/main';
import { IAttachment } from '../types';
import Alert from './Alert';
import confirm from './confirmation/confirm';
import router from './router';
import toggleCheckBoxes from './toggleCheckBoxes';
import uploadHandler from './uploadHandler';
import urlParser from './urlParser';

export const renderFullName = data => {
  if (data.firstName || data.lastName) {
    return (data.firstName || '') + ' ' + (data.lastName || '');
  }

  if (data.primaryEmail || data.primaryPhone) {
    return data.primaryEmail || data.primaryPhone;
  }

  if (data.emails && data.emails.length > 0) {
    return data.emails[0] || 'Unknown';
  }

  const { visitorContactInfo } = data;

  if (visitorContactInfo) {
    return visitorContactInfo.phone || visitorContactInfo.email || 'Unknown';
  }

  return 'Unknown';
};

export const renderUserFullName = data => {
  const { details } = data;

  if (details && details.fullName) {
    return details.fullName;
  }

  if (data.email || data.username) {
    return data.email || data.username;
  }

  return 'Unknown';
};

export const setTitle = (title: string, force: boolean) => {
  if (!document.title.includes(title) || force) {
    document.title = title;
  }
};

export const setBadge = (count: number, title: string) => {
  const favicon = document.getElementById('favicon') as HTMLAnchorElement;

  if (count) {
    if (document.title.includes(title)) {
      setTitle(`(${count}) ${title}`, true);
    }

    favicon.href = '/favicon-unread.png';
  } else {
    setTitle(title, true);
    favicon.href = '/favicon.png';
  }
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

export const generateRandomColorCode = () => {
  return `#${Math.random()
    .toString(16)
    .slice(2, 8)}`;
};

const isNumeric = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

export const isTimeStamp = timestamp => {
  const newTimestamp = new Date(timestamp).getTime();
  return isNumeric(newTimestamp);
};

// Create an array with "stop" numbers, starting from "start"
export const range = (start: number, stop: number) => {
  return Array.from(Array(stop), (_, i) => start + i);
};

// Return the list of values that are the intersection of two arrays
export const intersection = (array1: any[], array2: any[]) => {
  return array1.filter(n => array2.includes(n));
};

// Computes the union of the passed-in arrays: the list of unique items
export const union = (array1: any[], array2: any[]) => {
  return array1.concat(array2.filter(n => !array1.includes(n)));
};

// Similar to without, but returns the values from array that are not present in the other arrays.
export const difference = (array1: any[], array2: any[]) => {
  return array1.filter(n => !array2.includes(n));
};

export { Alert, uploadHandler, router, confirm, toggleCheckBoxes, urlParser };

export const can = (actionName: string, currentUser: IUser): boolean => {
  if (!currentUser) {
    return false;
  }

  if (currentUser.isOwner) {
    return true;
  }

  if (!actionName) {
    return false;
  }

  const actions = currentUser.permissionActions || [];

  return actions[actionName] === true;
};

export const __ = (key: string, options?: any) => {
  const translation = T.translate(key, options);

  if (!translation) {
    return '';
  }

  return translation.toString();
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

  const { REACT_APP_API_URL } = getEnv();

  return `${REACT_APP_API_URL}/read-file?key=${value}`;
};

export const getUserAvatar = (user: IUserDoc) => {
  if (!user) {
    return '';
  }

  const { details = {} } = user;

  if (!details.avatar) {
    return '/images/avatar-colored.svg';
  }

  return readFile(details.avatar);
};

export function withProps<IProps>(
  Wrapped: new (props: IProps) => React.Component<IProps>
) {
  return class WithProps extends React.Component<IProps, {}> {
    render() {
      return <Wrapped {...this.props} />;
    }
  };
}

export function renderWithProps<Props>(
  props: Props,
  Wrapped: new (props: Props) => React.Component<Props>
) {
  return <Wrapped {...props} />;
}

export const isValidDate = date => {
  const parsedDate = Date.parse(date);

  // Checking if it is date
  if (isNaN(date) && !isNaN(parsedDate)) {
    return true;
  }

  return false;
};

export const extractAttachment = (attachments: IAttachment[]) => {
  return attachments.map(file => ({
    name: file.name,
    type: file.type,
    url: file.url,
    size: file.size
  }));
};

export const setCookie = (cname: string, cvalue: string, exdays = 100) => {
  const d = new Date();

  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);

  const expires = `expires=${d.toUTCString()}`;

  document.cookie = `${cname}=${cvalue};${expires};path=/`;
};

export const getCookie = cname => {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');

  for (let c of ca) {
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return '';
};

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

/**
 * Generate random int number between 0 and max
 */

export const getRandomNumber = (max: number = 10) => {
  return Math.floor(Math.random() * Math.floor(max));
};

/**
 * Send desktop notification
 */
export const sendDesktopNotification = (doc: {
  title: string;
  content?: string;
}) => {
  const notify = () => {
    // Don't send notification to itself
    if (!window.document.hidden) {
      return;
    }

    const notification = new Notification(doc.title, {
      body: doc.content,
      icon: '/favicon.png',
      dir: 'ltr'
    });

    // notify by sound
    const audio = new Audio('/sound/notify.mp3');
    audio.play();

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Browser doesn't support Notification api
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    return notify();
  }

  if (Notification.permission !== 'denied') {
    Notification.requestPermission(permission => {
      if (!('permission' in Notification)) {
        (Notification as any).permission = permission;
      }

      if (permission === 'granted') {
        return notify();
      }
    });
  }
};

export const roundToTwo = value => {
  if (!value) {
    return 0;
  }

  return Math.round(value * 100) / 100;
};

function createLinkFromUrl(url) {
  if (!url.includes('http')) {
    url = 'http://' + url;
  }

  const onClick = e => {
    e.stopPropagation();
    window.open(url);
  };

  return (
    <a href="#website" onClick={onClick}>
      {urlParser.extractRootDomain(url)}
    </a>
  );
}

export function formatValue(value) {
  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (urlParser.isValidURL(value)) {
    return createLinkFromUrl(value);
  }

  if (typeof value === 'string') {
    if (
      dayjs(value).isValid() &&
      (value.includes('/') || value.includes('-'))
    ) {
      return (
        <Tip text={dayjs(value).format('D MMM YYYY, HH:mm')} placement="top">
          <time>{dayjs(value).format('L')}</time>
        </Tip>
      );
    }

    return <Limited>{value}</Limited>;
  }

  if (value && typeof value === 'object') {
    return value.toString();
  }

  return value || '-';
}

export function isEmptyContent(content: string) {
  // check if a string contains whitespace or empty
  return !/\S/.test(content);
}

export const isValidUsername = (username: string) => {
  const reg = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/igm;

  return reg.test(username);
};


export const storeConstantToStore = (key, values) => {
  localStorage.setItem(`config:${key}`, JSON.stringify(values));
};

export const getConstantFromStore = (
  key,
  isMap?: boolean,
  isFlat?: boolean
) => {
  const constant = JSON.parse(localStorage.getItem(`config:${key}`) || '[]');

  if (isFlat) {
    return constant.map(element => element.value);
  }

  if (!isMap) {
    return constant;
  }

  const map = {};

  constant.forEach(element => {
    map[element.value] = element.label;
  });

  return map;
};
