import { readImage, REACT_APP_API_URL } from 'erxes-ui';

/** Uploads an image an email links to, and returns the address it loads from. */
export const uploadEmailImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'post',
    body: formData,
    credentials: 'include',
  });

  const fileKey = await response.text();

  if (!response.ok || !fileKey) {
    throw new Error(fileKey || 'Failed to upload image');
  }

  return readImage(fileKey);
};
