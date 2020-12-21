import { getEnv, uploadHandler } from 'modules/common/utils';

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
