declare var __webpack_init_sharing__;
declare var __webpack_share_scopes__;
declare var window;

import * as router from './router';

import { IUser, IUserDoc } from '../auth/types';

import ErrorBoundary from '../components/ErrorBoundary';
import { IAttachment } from '../types';
import { Limited } from '../styles/main';
import React from 'react';
import T from 'i18n-react';
import Tip from '../components/Tip';
import dayjs from 'dayjs';
import urlParser from './urlParser';

export { urlParser, router };

export const loadComponent = (scope, module) => {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__('default');

    const container = window[scope]; // or get the container somewhere else

    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);

    const Module = factory();
    return Module;
  };
};

export const loadCustomPlugin = (
  pluginName: string,
  componentName: string,
  injectedProps?: any
): any => {
  const plugins: any[] = (window as any).plugins || [];

  for (const plugin of plugins) {
    if (pluginName === plugin.name) {
      return (
        <ErrorBoundary>
          <RenderDynamicComponent
            scope={plugin.scope}
            component={plugin[componentName]}
            injectedProps={injectedProps ? injectedProps : {}}
          />
        </ErrorBoundary>
      );
    }

    return null;
  }
};

export class RenderDynamicComponent extends React.Component<
  { scope: string; component: any; injectedProps: any },
  { showComponent: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { showComponent: false };
  }

  componentDidMount() {
    const interval = setInterval(() => {
      if (window[this.props.scope]) {
        window.clearInterval(interval);

        this.setState({ showComponent: true });
      }
    }, 500);
  }

  renderComponent = () => {
    if (!this.state.showComponent) {
      return null;
    }

    const { scope, component, injectedProps } = this.props;

    const Component = React.lazy(loadComponent(scope, component));

    return (
      <React.Suspense fallback="">
        <Component {...injectedProps} />
      </React.Suspense>
    );
  };

  render() {
    return this.renderComponent();
  }
}

export const renderFullName = data => {
  if (data.firstName || data.lastName || data.middleName || data.primaryPhone) {
    return (
      (data.firstName || '') +
      ' ' +
      (data.middleName || '') +
      ' ' +
      (data.lastName || '') +
      ' ' +
      (data.primaryPhone || '')
    );
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

  if (favicon) {
    if (count) {
      if (document.title.includes(title)) {
        setTitle(`(${count}) ${title}`, true);
      }

      favicon.href = '/favicon-unread.png';
    } else {
      setTitle(title, true);
      favicon.href = '/favicon.png';
    }
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

export const isEnabled = (service: string) => {
  const enabledServices = JSON.parse(
    localStorage.getItem('enabledServices') || '{}'
  );

  return enabledServices[service];
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
    size: file.size,
    duration: file.duration
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

export const calculatePercentage = (total: number, done: number) => {
  if (total > 0) {
    return roundToTwo((done * 100) / total);
  }

  return 0;
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
  const reg = /^(?=[a-zA-Z0-9._]{4,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/gim;

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

// Most basic frontend solution for click-jack defense
export const bustIframe = () => {
  if (window.self === window.top) {
    const antiClickjack = document.getElementById('anti-clickjack');

    if (antiClickjack && antiClickjack.parentNode) {
      antiClickjack.parentNode.removeChild(antiClickjack);
    }
  } else {
    window.top.location = window.self.location;
  }
};

// get env config from process.env or window.env
export const getEnv = (): any => {
  const envs = {};

  for (const envMap of (window as any).envMaps) {
    envs[envMap.name] = localStorage.getItem(`erxes_env_${envMap.name}`);
  }

  return envs;
};

export const cleanIntegrationKind = (name: string) => {
  if (name.includes('nylas')) {
    name = name.replace('nylas-', '');
  }
  if (name.includes('smooch')) {
    name = name.replace('smooch-', '');
  }
  if (name === 'lead') {
    name = 'forms';
  }
  return name;
};

export const getConfig = (key: string) => {
  const sidebarConfig = localStorage.getItem(key);

  if (sidebarConfig) {
    return JSON.parse(sidebarConfig);
  }
};

export const setConfig = (key, params) => {
  localStorage.setItem(key, JSON.stringify(params));
};

export const generateTree = (
  list,
  parentId,
  callback,
  level = -1,
  parentKey = 'parentId'
) => {
  const filtered = list.filter(c => c[parentKey] === parentId);

  if (filtered.length > 0) {
    level++;
  } else {
    level--;
  }

  return filtered.reduce((tree, node) => {
    return [
      ...tree,
      callback(node, level),
      ...generateTree(list, node._id, callback, level, parentKey)
    ];
  }, []);
};

export const removeTypename = (obj?: any[] | any) => {
  if (Array.isArray(obj)) {
    return obj.map(item => {
      delete item.__typename;

      return item;
    });
  }

  delete obj.__typename;

  return obj;
};

export const publicUrl = path => {
  const { REACT_APP_PUBLIC_PATH } = window.env || {};

  let prefix = '';

  if (REACT_APP_PUBLIC_PATH) {
    prefix = `${REACT_APP_PUBLIC_PATH}/`;
  }

  return `${prefix}${path}`;
};
