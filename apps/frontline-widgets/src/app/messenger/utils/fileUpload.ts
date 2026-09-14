import { DEFAULT_MAX_UPLOAD_SIZE } from '../constants';

export type PendingFile = {
  name: string;
  type: string;
  size: number;
  preview?: string;
  state: 'uploading' | 'error';
  error?: string;
};

export const getMaxUploadSize = (): number =>
  Number.parseInt(
    localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') || '',
    10,
  ) || DEFAULT_MAX_UPLOAD_SIZE;

export const toPendingFile = (
  file: File,
  state: PendingFile['state'],
): PendingFile => ({
  name: file.name,
  type: file.type,
  size: file.size,
  preview: file.type.startsWith('image/')
    ? URL.createObjectURL(file)
    : undefined,
  state,
});
