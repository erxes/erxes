import { normalizePublicUrl } from '../../shared/utils';
import { CmsAttachment, CmsSettingsData } from '../types/settingsTypes';

export const languageLabel = (language: string) => {
  const labels: Record<string, string> = {
    en: 'English',
    mn: 'Mongolian',
  };

  return labels[language] || language.toUpperCase();
};

export const buildPublicUrl = (domain?: string) => {
  return normalizePublicUrl(domain);
};

export const toCmsAttachment = (
  attachment: CmsSettingsData['metaImage'] | undefined,
): CmsAttachment | null =>
  attachment
    ? {
        url: attachment.url,
        name: attachment.name ?? '',
        type: attachment.type ?? undefined,
        size: attachment.size ?? undefined,
        duration: attachment.duration ?? undefined,
      }
    : null;
