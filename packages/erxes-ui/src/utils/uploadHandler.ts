import Alert from '../utils/Alert';
import { getEnv } from '../utils/core';

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
  progress?: number; // added for progress updates
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
  extraFormData?: Array<{ key: string; value: string }>;
  maxHeight?: number;
  maxWidth?: number;
};

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const THRESHOLD = 20 * 1024 * 1024; // 20MB threshold
const POLL_INTERVAL = 5000; // 5 seconds poll for status to avoid overwhelming the server

const getVideoDuration = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader() as any;
    reader.onload = () => {
      const media = new Audio(reader.result);
      media.onloadedmetadata = () => resolve(media.duration);
    };
    reader.readAsDataURL(file);
    reader.onerror = (error: any) => reject(error);
  });

const uploadDirect = async (
  file: File,
  fileInfo: FileInfo,
  params: Params,
  afterUpload: Params['afterUpload']
) => {
  const { url = `${getEnv().REACT_APP_API_URL}/upload-file`, kind = 'main', extraFormData = [] } = params;

  const formData = new FormData();
  formData.append('file', file);
  for (const data of extraFormData) {
    formData.append(data.key, data.value);
  }

  return new Promise<void>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${url}?kind=${kind}`, true);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        // cap at 95% to leave room for server processing
        const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
        afterUpload({ status: 'ok', response: null, fileInfo, progress: percent });
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          afterUpload({ status: 'ok', response: xhr.responseText, fileInfo });
        } else {
          afterUpload({ status: 'error', response: xhr.responseText || xhr.statusText, fileInfo });
        }
        resolve();
      }
    };

    xhr.onerror = () => {
      Alert.error('Upload failed');
      afterUpload({ status: 'error', response: 'Upload failed', fileInfo });
      resolve();
    };

    xhr.send(formData);
  });
};

const uploadChunked = async (
  file: File,
  fileInfo: FileInfo,
  apiUrl: string,
  afterUpload: Params['afterUpload']
) => {
  // 1. Init
  const initRes = await fetch(`${apiUrl}/upload-chunked/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      totalChunks: Math.ceil(file.size / CHUNK_SIZE),
    }),
  });

  if (!initRes.ok) {
    afterUpload({ status: 'error', response: await initRes.text(), fileInfo });
    return;
  }

  const { uploadId } = await initRes.json();

  // Upload chunks with progress
  let uploadedChunks = 0;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', i.toString());

    const chunkRes = await fetch(`${apiUrl}/upload-chunked/chunk`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!chunkRes.ok) {
      afterUpload({ status: 'error', response: await chunkRes.text(), fileInfo });
      return;
    }

    uploadedChunks++;
    const progress = Math.round((uploadedChunks / totalChunks) * 80); // 80% for chunks, 20% for final processing
    afterUpload({ status: 'ok', response: null, fileInfo, progress });
  }

  // Poll for final status
  const poll = setInterval(async () => {
    const statusRes = await fetch(`${apiUrl}/upload-status/${uploadId}`, { credentials: 'include' });
    if (!statusRes.ok) {
      clearInterval(poll);
      afterUpload({ status: 'error', response: 'Status check failed', fileInfo });
      return;
    }

    const status = await statusRes.json();
    if (status.progress) {
      afterUpload({ status: 'ok', response: null, fileInfo, progress: status.progress });
    }

    if (status.status === 'completed') {
      clearInterval(poll);
      afterUpload({ status: 'ok', response: status.key, fileInfo });
    } else if (status.status === 'failed') {
      clearInterval(poll);
      afterUpload({ status: 'error', response: status.error || 'Upload failed', fileInfo });
    }
  }, POLL_INTERVAL);
};

export const uploadHandler = async (params: Params) => {
  const { REACT_APP_API_URL } = getEnv();
  const apiUrl = REACT_APP_API_URL;

  const {
    files,
    beforeUpload,
    afterUpload,
    afterRead,
    extraFormData = [],
    maxHeight = '',
    maxWidth = ''
  } = params;

  if (!files || files.length === 0) return;

  // const fileUploadMaxSize = parseInt(localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') || '', 10) || 20 * 1024 * 1024;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let type = file.type;
    if (file.name.endsWith('.hwp')) type = 'application/haansoft-hwp';
    if (file.name.endsWith('.hwpx')) type = 'application/haansoft-hwpml';

    let fileInfo: FileInfo = {
      name: file.name,
      size: file.size,
      type,
      duration: 0,
    };

    if (type.includes('audio') || type.includes('video')) {
      const duration = await getVideoDuration(file);
      fileInfo = { ...fileInfo, duration };
    }


    // Preview read
    const reader = new FileReader();
    reader.onloadend = () => afterRead?.({ result: reader.result, fileInfo });
    reader.readAsDataURL(file);

    beforeUpload?.();

    if (file.size <= THRESHOLD) {
      await uploadDirect(file, fileInfo, params, afterUpload);
    } else {
      await uploadChunked(file, fileInfo, apiUrl, afterUpload);
    }
  }
};

export default uploadHandler;