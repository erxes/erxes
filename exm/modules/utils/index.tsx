import * as animations from './animations';

import Alert from './Alert';
import { IUserDoc } from '../auth/types';
import React from 'react';
import confirm from './confirmation/confirm';
import { getEnv } from '../../utils/configs';
import parseMD from './parseMd';
import toggleCheckBoxes from './toggleCheckBoxes';
import urlParser from './urlParser';

type FileInfo = {
  name: string;
  size: number;
  type: string;
  duration: number;
};

type AfterUploadParams = {
  status: 'ok' | 'error';
  response: any;
  fileInfo: FileInfo;
};

type AfterReadParams = {
  result: any;
  fileInfo: FileInfo;
};

type Params = {
  files: FileList | null;
  beforeUpload: () => void;
  afterUpload: (params: AfterUploadParams) => void;
  afterRead?: (params: AfterReadParams) => void;
  url?: string;
  kind?: string;
  userId?: string;
  responseType?: string;
  extraFormData?: [{ key: string; value: string }];
};

const getVideoDuration = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader() as any;
    reader.onload = () => {
      const media = new Audio(reader.result);
      media.onloadedmetadata = () => resolve(media.duration);
    };
    reader.readAsDataURL(file);
    reader.onerror = (error) => reject(error);
  });

export const deleteHandler = (params: {
  fileName: string;
  url?: string;
  afterUpload: ({ status }: { status: string }) => any;
}) => {
  const { REACT_APP_DOMAIN } = getEnv();

  let url = `${REACT_APP_DOMAIN}/gateway/pl:core/delete-file`;

  if (REACT_APP_DOMAIN.includes('localhost')) {
    url = `${REACT_APP_DOMAIN}/pl:core/delete-file`;
  }

  const { fileName, afterUpload } = params;

  fetch(`${url}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: `fileName=${fileName}`,
    credentials: 'include'
  }).then((response) => {
    response
      .text()
      .then((text) => {
        if (!response.ok) {
          return afterUpload({
            status: text
          });
        }

        return afterUpload({ status: 'ok' });
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  });
};

const sendDesktopNotification = (doc: { title: string; content?: string }) => {
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
    Notification.requestPermission((permission) => {
      if (!('permission' in Notification)) {
        (Notification as any).permission = permission;
      }

      if (permission === 'granted') {
        return notify();
      }
    });
  }
};

export const getThemeItem = (code) => {
  const configs = JSON.parse(
    typeof window !== 'undefined'
      ? localStorage.getItem('erxes_theme_configs')
      : '[]'
  );
  const config = (configs || []).find(
    (c) => c.code === `THEME_${code.toUpperCase()}`
  );

  return config ? config.value : '';
};

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

export const setTitle = (title: string, force: boolean) => {
  if (!document.title.includes(title) || force) {
    document.title = title;
  }
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

export const readFile = (value: string, width?: number): string => {
  if (
    !value ||
    urlParser.isValidURL(value) ||
    (typeof value === 'string' && value.includes('http')) ||
    (typeof value === 'string' && value.startsWith('/'))
  ) {
    return value;
  }

  const { REACT_APP_DOMAIN } = getEnv();

  let url = `${REACT_APP_DOMAIN}/gateway/pl:core/read-file?key=${value}`;

  if (width) {
    url += `&width=${width}`;
  }

  if (REACT_APP_DOMAIN.includes('localhost')) {
    url = `${REACT_APP_DOMAIN}/read-file?key=${value}`;

    if (width) {
      url += `&width=${width}`;
    }

    return url;
  }

  return url;
};

export const getUserAvatar = (user: IUserDoc, width?: number) => {
  if (!user) {
    return '';
  }

  const details = user.details;

  if (!details || !details.avatar) {
    return '/images/avatar-colored.svg';
  }

  return readFile(details.avatar, width);
};

const getURL = () => {
  const { REACT_APP_DOMAIN } = getEnv();

  if (REACT_APP_DOMAIN.includes('localhost')) {
    return `${REACT_APP_DOMAIN}/upload-file`;
  }
  return `${REACT_APP_DOMAIN}/gateway/pl:core/upload-file`;
};

const uploadHandler = async (params: Params) => {
  const { REACT_APP_FILE_UPLOAD_MAX_SIZE } = getEnv();

  const {
    files,
    beforeUpload,
    afterUpload,
    afterRead,
    url = getURL(),
    kind = 'main',
    responseType = 'text',
    userId,
    extraFormData = []
  } = params;

  if (!files) {
    return;
  }

  if (files.length === 0) {
    return;
  }

  // tslint:disable-next-line
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // initiate upload file reader
    const uploadReader = new FileReader();

    let fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      duration: 0
    } as any;

    if (file.type.includes('audio') || file.type.includes('video')) {
      const duration = await getVideoDuration(file);

      fileInfo = { ...fileInfo, duration };
    }

    const fileUploadMaxSize =
      REACT_APP_FILE_UPLOAD_MAX_SIZE || 20 * 1024 * 1024;

    // skip file that size is more than REACT_APP_FILE_UPLOAD_MAX_SIZE
    if (fileInfo.size > parseInt(fileUploadMaxSize, 10)) {
      Alert.warning(
        `Your file ${fileInfo.name} size is too large. Upload files less than ${
          fileUploadMaxSize / 1024 / 1024
        }MB of size.`
      );

      continue;
    }

    // after read proccess done
    uploadReader.onloadend = () => {
      // before upload
      if (beforeUpload) {
        beforeUpload();
      }

      const formData = new FormData();
      formData.append('file', file);

      for (const data of extraFormData) {
        formData.append(data.key, data.value);
      }

      fetch(`${url}?kind=${kind}`, {
        method: 'post',
        body: formData,
        credentials: 'include',
        ...(userId ? { headers: { userId } } : {})
      })
        .then((response) => {
          response[responseType]()
            .then((text) => {
              if (!response.ok) {
                return afterUpload({
                  status: 'error',
                  response,
                  fileInfo
                });
              }

              // after upload
              if (afterUpload) {
                afterUpload({ status: 'ok', response: text, fileInfo });
              }
            })
            .catch((error) => {
              Alert.error(error.message);
            });
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    };

    // begin read
    uploadReader.readAsArrayBuffer(file);

    // read as data url for preview purposes
    const reader = new FileReader();

    reader.onloadend = () => {
      if (afterRead) {
        afterRead({ result: reader.result, fileInfo });
      }
    };

    reader.readAsDataURL(file);
  }
};

export {
  animations,
  parseMD,
  Alert,
  confirm,
  toggleCheckBoxes,
  urlParser,
  sendDesktopNotification,
  uploadHandler
};
