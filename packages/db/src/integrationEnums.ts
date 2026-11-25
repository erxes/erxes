/** Integration lists, kept with `./enums` (which re-exports them). */

/** In the order Settings › Integrations lists them. */
export const INTEGRATION_CATEGORIES = [
  'payments',
  'banks',
  'sign_in',
  'social',
  'messaging',
  'email',
  'government',
  'developer',
  'productivity',
  'ai',
  'decision',
] as const;

export const INTEGRATION_CONNECTION_STATUSES = ['active', 'disabled'] as const;

/** Who a connection serves: the whole organisation, or only the member who added it. */
export const INTEGRATION_SCOPES = ['org', 'personal'] as const;

/** `app`: an installation of the server's GitHub App, with a token core mints on use. */
export const INTEGRATION_AUTH_KINDS = ['keys', 'oauth', 'app'] as const;

export const INTEGRATION_SUBSCRIPTION_STATUSES = ['syncing', 'listening', 'broken'] as const;

export const APP_TRIGGER_DELIVERIES = ['hook', 'poll'] as const;

export const OAUTH_CLIENT_SOURCES = ['server', 'organization'] as const;

export const VAULT_HOLDERS = [
  'email',
  'file-bucket',
  'webhook',
  'audit-stream',
  'two-step',
  'plugin',
] as const;

export const INTEGRATION_STATES = ['connected', 'off', 'attention', 'not-set-up'] as const;

export const INTEGRATION_FIELD_TYPES = ['text', 'secret', 'switch', 'select', 'hidden'] as const;

/** An issue's state as "Edit an issue" sets it: open, or closed for a reason. */
export const GITHUB_ISSUE_STATES = ['open', 'completed', 'not_planned'] as const;

export const GITHUB_PULL_STATES = ['open', 'closed'] as const;

export const GITHUB_LIST_STATES = ['open', 'closed', 'all'] as const;

export const GITHUB_LOCK_REASONS = ['off-topic', 'too heated', 'resolved', 'spam'] as const;

export const GITHUB_MERGE_METHODS = ['merge', 'squash', 'rebase'] as const;

export const GITHUB_REVIEW_EVENTS = ['APPROVE', 'REQUEST_CHANGES', 'COMMENT', 'PENDING'] as const;

export const GITHUB_ISSUE_SORTS = ['created', 'updated', 'comments'] as const;

export const GITHUB_PULL_SORTS = ['created', 'updated', 'popularity', 'long-running'] as const;

export const GITHUB_SORT_DIRECTIONS = ['desc', 'asc'] as const;

export const GITHUB_ISSUE_FILTERS = [
  'assigned',
  'created',
  'mentioned',
  'subscribed',
  'all',
] as const;

export const GITHUB_ORG_ROLES = ['direct_member', 'admin', 'billing_manager'] as const;

export const TELEGRAM_PARSE_MODES = ['MarkdownV2', 'HTML'] as const;

export const TELEGRAM_CHAT_ACTIONS = [
  'typing',
  'upload_photo',
  'upload_video',
  'record_video',
  'record_voice',
  'upload_voice',
  'upload_document',
  'choose_sticker',
  'find_location',
  'record_video_note',
  'upload_video_note',
] as const;

export const TELEGRAM_ALBUM_KINDS = ['photo', 'video', 'document', 'audio'] as const;

export const TELEGRAM_JOIN_DECISIONS = ['approve', 'decline'] as const;

export const FACEBOOK_ATTACHMENT_KINDS = ['image', 'video', 'audio', 'file'] as const;
