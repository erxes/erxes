import { getEnv } from "./utils";

type FileInfo = {
  name: string;
  size: number;
  type: string;
};

type UploaderParams = {
  files: FileList;
  beforeUpload?: () => void;
  afterUpload?: (doc: { response: string; fileInfo: FileInfo }) => void;
  onError: (message: string) => void;
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
    files,
    beforeUpload,
    afterUpload,
    onError,

    // for preview purpose
    afterRead
  } = params;

  const { API_URL } = getEnv();

  const url = `${API_URL}/upload-file`;

  // initiate upload file reader

  if (!files || files.length === 0) return;

  for (const file of Array.from(files)) {
    const fileInfo = { name: file.name, size: file.size, type: file.type };
   
    // after read proccess done
    const uploadReader = new FileReader();
    
    uploadReader.onloadend = () => {
      // before upload
      if (beforeUpload) {
        beforeUpload();
      }
  
      const formData = new FormData();
  
      formData.append("file", file);
  
      fetch(url, {
        method: "post",
        body: formData,
        headers: {
          source: "widgets"
        }
      })
        .then(response => {
          if (!response.ok) {
            throw response;
          }
  
          return response.text();
        })
  
        .then(response => {
          // after upload
          if (afterUpload) {
            afterUpload({ response, fileInfo });
          }
        })
  
        .catch(errorResponse => {
          errorResponse.text().then((text: string) => {
            onError(text);
          });
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
  
  }
};

export default uploadHandler;
