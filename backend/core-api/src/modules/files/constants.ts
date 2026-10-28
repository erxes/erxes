export const FILE_STATUSES = {
  UPLOADING: 'uploading',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export type TFileStatus = (typeof FILE_STATUSES)[keyof typeof FILE_STATUSES];

export const FILE_PREVIEW_STATUSES = {
  PENDING: 'pending',
  READY: 'ready',
  FAILED: 'failed',
  NONE: 'none',
} as const;

export type TFilePreviewStatus =
  (typeof FILE_PREVIEW_STATUSES)[keyof typeof FILE_PREVIEW_STATUSES];

// R2 rejects multipart uploads with unequal part sizes.
export const FILES_PART_SIZE = 16 * 1024 * 1024;
export const FILES_MAX_PARTS = 10000;
export const FILES_SINGLE_UPLOAD_MAX = FILES_PART_SIZE;
export const FILES_SIGN_BATCH = 50;

export const FILES_UPLOAD_SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000;
export const FILES_TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const FILES_SWEEP_EVERY_MS = 60 * 60 * 1000;

export const FILES_DEFAULT_MAX_FILE_SIZE_MB = 5120;

export const FILES_QUEUE = 'files';

export const FILES_THUMBNAIL_SIZE = 320;
// Signed per window so refetches hit the browser cache.
export const FILES_THUMBNAIL_URL_WINDOW_MS = 60 * 60 * 1000;
// Jimp decodes the whole bitmap in memory.
export const FILES_THUMBNAIL_IMAGE_MAX = 30 * 1024 * 1024;
// Jimp allocates width × height × 4 bytes however small the file is.
export const FILES_THUMBNAIL_MAX_PIXELS = 50 * 1000 * 1000;
export const FILES_DERIVE_PDF_MAX = 1024 * 1024 * 1024;
export const FILES_DERIVE_TIMEOUT_MS = 5 * 60 * 1000;
// A pending preview this old lost its job (worker restart, queue flush).
export const FILES_DERIVE_STALE_MS = 60 * 60 * 1000;
export const FILES_USAGE_ID = 'usage';

export const FILE_ACCESS_ROLES = {
  VIEWER: 'viewer',
  CONTRIBUTOR: 'contributor',
  MANAGER: 'manager',
} as const;

export type TFileAccessRole = (typeof FILE_ACCESS_ROLES)[keyof typeof FILE_ACCESS_ROLES];

export const FILE_ACCESS_ROLE_RANK: Record<TFileAccessRole, number> = {
  viewer: 1,
  contributor: 2,
  manager: 3,
};

export const FILE_PRINCIPAL_TYPES = {
  USER: 'user',
  ENTITY: 'entity',
  EVERYONE: 'everyone',
} as const;

export type TFilePrincipalType =
  (typeof FILE_PRINCIPAL_TYPES)[keyof typeof FILE_PRINCIPAL_TYPES];

export const FILES_ORG_ROOT_KEY = 'org';
export const FILES_MAX_GRANTS = 100;
export const FILES_MAX_PINS = 10;
export const FILES_ACCESS_SYNC_MAX_FOLDERS = 200;
export const FILES_PRINCIPALS_TTL_SECONDS = 60;
export const FILES_SPACES_TTL_SECONDS = 24 * 60 * 60;
