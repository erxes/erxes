import { uploadFormFile } from '@/modules/forms/utils/upload';
import type { Translate } from '@/modules/i18n/translate';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';

export const uploadAvatar = async (
  file: File,
  apiUrl: string,
  t: Translate,
): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error(t('auth.avatarNotImage'));
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error(t('auth.avatarTooLarge'));
  }

  const { url } = await uploadFormFile(file, apiUrl, t);

  return url;
};
