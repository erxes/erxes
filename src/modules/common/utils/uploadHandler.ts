import { getEnv } from 'apolloClient';
import { Alert } from 'modules/common/utils';

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
  responseType?: string;
  extraFormData?: Array<{ key: string; value: string }>;
};

const uploadHandler = (params: Params) => {
  const { REACT_APP_API_URL } = getEnv();

  const {
    files,
    beforeUpload,
    afterUpload,
    afterRead,
    url = `${REACT_APP_API_URL}/upload-file`,
    responseType = 'text',
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

      fetch(url, {
        method: 'post',
        body: formData,
        credentials: 'include'
      })
        .then(response => {
          response[responseType]()
            .then(text => {
              if (!response.ok) {
                return afterUpload({
                  status: 'error',
                  response: text,
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
