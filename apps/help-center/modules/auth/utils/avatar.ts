import { uploadFormFile } from '@/modules/forms/utils/upload';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

export const uploadAvatar = async (
  file: File,
  apiUrl: string,
): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('The profile picture must be an image.');
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('The profile picture must be smaller than 5MB.');
  }

  const { url } = await uploadFormFile(file, apiUrl);

  return url;
};
