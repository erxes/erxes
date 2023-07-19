import { getEnv } from '../../utils/configs';
import Alert from '../utils/Alert';

type FileInfo = {
  name: string;
  size: number;
  type: string;
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
  extraFormData?: { key: string; value: string }[];
};

export const deleteHandler = (params: {
  fileName: string;
  url?: string;
  afterUpload: ({ status }: { status: string }) => any;
}) => {
  const { REACT_APP_MAIN_API_DOMAIN } = getEnv();

  const {
    url = `${REACT_APP_MAIN_API_DOMAIN}/delete-file`,
    fileName,
    afterUpload
  } = params;

  fetch(`${url}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: `fileName=${fileName}`,
    credentials: 'include'
  }).then(response => {
    response
      .text()
      .then(text => {
        if (!response.ok) {
          return afterUpload({
            status: text
          });
        }

        return afterUpload({ status: 'ok' });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  });
};

const getURL = () => {
  const { REACT_APP_DOMAIN } = getEnv();

  if (REACT_APP_DOMAIN.includes('localhost')) {
    return `${REACT_APP_DOMAIN}/upload-file`;
  }
  return `${REACT_APP_DOMAIN}/gateway/pl:core/upload-file`;
};

const uploadHandler = (params: Params) => {
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

    const fileInfo = { name: file.name, size: file.size, type: file.type };

    // skip file that size is more than 15mb
    if (fileInfo.size > 20 * 1024 * 1024) {
      Alert.warning(
        `Your file ${fileInfo.name} size is too large. Upload files less than 15MB of size.`
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
        .then(response => {
          response[responseType]()
            .then(text => {
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
            .catch(error => {
              Alert.error(error.message);
            });
        })
        .catch(error => {
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

export default uploadHandler;
