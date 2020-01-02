import { getEnv } from "./utils";

type FileInfo = {
  name: string;
  size: number;
  type: string;
};

type UploaderParams = {
  file: File;
  beforeUpload?: () => void;
  afterUpload?: (doc: { response: string; fileInfo: FileInfo }) => void;
  afterRead?: (
    doc: { result: string | ArrayBuffer | null; fileInfo: FileInfo }
  ) => void;
};

/**
 * Upload file to main api
 */
const uploadHandler = (params: UploaderParams) => {
  const {
    // Blob object
    file,

    beforeUpload,
    afterUpload,

    // for preview purpose
    afterRead
  } = params;

  const { API_URL } = getEnv();

  const url = `${API_URL}/upload-file`;

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
    formData.append("file", file);

    fetch(url, {
      method: "post",
      body: formData
    })
      .then(response => {
        return response.text();
      })

      .then(response => {
        // after upload
        if (afterUpload) {
          afterUpload({ response, fileInfo });
        }
      })

      .catch(e => {
        console.log(e); // eslint-disable-line
      });
  };

  // begin read
  uploadReader.readAsArrayBuffer(file);

  // read as data url for preview purposes
  const reader = new FileReader();

  reader.onloadend = () => {
    if (afterRead) {
      afterRead({
        result: reader.result,
        fileInfo
      });
    }
  };

  reader.readAsDataURL(file);
};

export default uploadHandler;
