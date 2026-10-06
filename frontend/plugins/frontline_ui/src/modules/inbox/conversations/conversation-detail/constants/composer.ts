import { IntegrationType } from '@/types/Integration';

export const NOTE_ONLY_INTEGRATION_KINDS: string[] = [
  'lead',
  IntegrationType.CALL,
  IntegrationType.CALLPRO,
  IntegrationType.MAIL,
];

export const MEDIA_BLOCK_TYPES = new Set(['image', 'video', 'audio', 'file']);
export const PREVIEW_BLOCK_TYPES = new Set(['gallery', ...MEDIA_BLOCK_TYPES]);

export const GALLERY_COLUMN_CLASSES: Record<string, string> = {
  '2': '[&_[role=list]]:grid-cols-2',
  '3': '[&_[role=list]]:grid-cols-2 sm:[&_[role=list]]:grid-cols-3',
  '4': '[&_[role=list]]:grid-cols-2 sm:[&_[role=list]]:grid-cols-4',
};

export const GALLERY_COLUMN_OPTIONS = [2, 3, 4];
export const MAX_GALLERY_UPLOAD_FILES = 20;

export const MIN_COMPOSER_HEIGHT = 160;
export const DEFAULT_COMPOSER_HEIGHT = 240;
export const MIN_EDITOR_HEIGHT = 72;
export const COLLAPSED_COMPOSER_HEIGHT = 64;
export const MAX_AUTO_COMPOSER_SIZE = 50;
