import { getEnv } from 'apolloClient';
import { uploadHandler } from 'modules/common/utils';
import { LEAD_STATUS_TYPES, LIFECYCLE_STATE_TYPES } from './constants';

export const hasAnyActivity = log => {
  let hasAny = false;

  log.forEach(item => {
    if (item) {
      hasAny = true;
    }
  });

  return hasAny;
};

export const leadStatusChoices = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(LEAD_STATUS_TYPES)) {
    options.push({
      value: key,
      label: __(LEAD_STATUS_TYPES[key])
    });
  }

  return options;
};

export const lifecycleStateChoices = __ => {
  const options: Array<{ value: string; label: string }> = [];

  for (const key of Object.keys(LIFECYCLE_STATE_TYPES)) {
    options.push({
      value: key,
      label: __(LIFECYCLE_STATE_TYPES[key])
    });
  }

  return options;
};

export const regexPhone = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/;
export const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

export const handleXlsUpload = ({
  e,
  type,
  beforeUploadCallback,
  afterUploadCallback
}: {
  e: any;
  type: string;
  beforeUploadCallback?: () => void;
  afterUploadCallback?: (response) => void;
}) => {
  const xlsFile = e.target.files;

  const { REACT_APP_API_URL } = getEnv();

  uploadHandler({
    files: xlsFile,
    extraFormData: [{ key: 'type', value: type }],
    url: `${REACT_APP_API_URL}/import-file`,
    responseType: 'json',
    beforeUpload: () => {
      if (beforeUploadCallback) {
        beforeUploadCallback();
      }
    },

    afterUpload: ({ response }) => {
      if (afterUploadCallback) {
        afterUploadCallback(response);
      }
    }
  });

  e.target.value = null;
};
