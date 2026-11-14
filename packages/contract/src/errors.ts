import type { ErrorMap } from '@orpc/contract';
import { z } from 'zod';
import { InvalidInput } from './common';

const Permissions = z.object({ permissions: z.array(z.string()) });

/**
 * Every error the API answers with, by code: its status and the shape of its
 * `data`. A procedure declares the codes it can answer with (`COMMON_ERRORS`
 * plus its module's), so clients get them typed: `isDefinedError(error) &&
 * error.code === 'TAKEN'` narrows `error.data`. The API throws them with
 * `fail()` (apps/api/src/http/errors.ts).
 */
export const ERRORS = {
  // Who may call (http/access.ts) and the organisation's standing.
  UNAUTHORIZED: { status: 401 },
  NOT_ALLOWED: { status: 403, data: z.object({ permission: z.string() }).optional() },
  PLUGIN_ONLY: { status: 403 },
  MEMBERS_ONLY: { status: 403 },
  ORG_REQUIRED: { status: 403 },
  SCOPE_REQUIRED: { status: 403 },
  SERVICE_TOKEN_REQUIRED: { status: 403 },
  CROSS_SITE: { status: 403 },
  // A signed address (file links, payment callbacks) that is forged or expired.
  INVALID_SIGNATURE: { status: 403 },
  OWNER_ONLY: { status: 403 },
  OWN_ROLE: { status: 403 },
  OWN_ACCOUNT: { status: 403 },
  ORGANIZATION_DISABLED: { status: 403, data: z.object({ manageUrl: z.string().nullable() }) },
  NOT_IN_PLAN: { status: 402, data: z.object({ manageUrl: z.string().nullable() }).optional() },
  READ_ONLY: { status: 402 },
  TOO_MANY_REQUESTS: { status: 429 },
  // Open `/core/v1/stream` connections past the member's limit.
  TOO_MANY_STREAMS: { status: 429 },

  // Any procedure: input the contract refuses (or a body that isn't JSON), a missing record, a value
  // another record holds (a unique index, `field` names the input field;
  // `id` is that record when known), a stale list cursor.
  INVALID_INPUT: { status: 400, data: InvalidInput },
  INVALID_JSON: { status: 400 },
  NOT_FOUND: { status: 404 },
  TAKEN: {
    status: 409,
    data: z.object({
      field: z.string(),
      id: z.string().optional(),
      values: z.array(z.string()).optional(),
    }),
  },
  INVALID_CURSOR: { status: 400 },
  INVALID_REFERENCE: { status: 400, data: z.object({ field: z.string() }) },

  // Shared checks (lib/).
  INVALID_TYPE: { status: 400 },
  INVALID_ACTOR: { status: 400 },
  INVALID_OWNER: { status: 400 },
  INVALID_FILTER: { status: 400 },
  FILTER_TOO_SLOW: { status: 400 },
  LIMIT_EXCEEDED: { status: 400 },
  MASS_DELETE_STOPPED: { status: 429 },
  INVALID_URL: { status: 400 },
  INVALID_FILE: { status: 400 },

  // Sign-in, passwords, two-factor, invitations, setup.
  INVALID_CREDENTIALS: { status: 401 },
  CHALLENGE_EXPIRED: { status: 401 },
  WRONG_CODE: { status: 400 },
  WRONG_PASSWORD: { status: 400 },
  SAME_PASSWORD: { status: 400 },
  TOO_MANY_ATTEMPTS: { status: 429 },
  ORGANIZATION_REQUIRED: { status: 400 },
  ALREADY_ENABLED: { status: 409 },
  NOT_ENABLED: { status: 409 },
  NOT_SET_UP: { status: 409 },
  INVALID_LINK: { status: 400 },
  NOT_INVITED: { status: 409 },
  SETUP_DISABLED: { status: 403 },
  SETUP_DONE: { status: 409 },
  LAST_OWNER: { status: 409 },

  // Customer sign-in.
  INVALID_CODE: { status: 400 },
  INVALID_TOKEN: { status: 401 },
  TOO_MANY_CODES: { status: 429 },
  ORIGIN_NOT_ALLOWED: { status: 403 },
  UNKNOWN_APP: { status: 400 },
  LAST_LOGIN: { status: 409 },

  // Timeline, notifications, events.
  NOT_AUTHOR: { status: 403 },
  NO_TIMELINE: { status: 404 },
  TOO_MANY_REACTIONS: { status: 400 },
  INVALID_RECIPIENT: { status: 400 },
  ALWAYS_ON: { status: 400 },
  SUBJECT_REQUIRED: { status: 400 },
  NOTHING_TO_RETRY: { status: 400 },

  // Automations.
  INVALID_AUTOMATION: { status: 400, data: z.object({ problems: z.array(z.string()) }) },
  INVALID_STEP_INPUT: { status: 400 },
  NO_SUBJECT: { status: 400 },
  NO_MEMBERS: { status: 400 },
  NOT_ACTIVE: { status: 409 },
  NOT_FAILED: { status: 409 },
  NOT_RUNNING: { status: 409 },

  // Contacts, leads, tags, custom fields.
  NOT_A_LEAD: { status: 400 },
  INVALID_LEAD_STAGE: { status: 400, data: z.object({ stageId: z.string() }).optional() },
  LAST_OPEN_STAGE: { status: 409 },
  LEAD_STAGE_IN_USE: { status: 409, data: z.object({ count: z.int() }) },
  INVALID_TAG: { status: 400 },
  TAG_LIMIT: { status: 409 },
  INVALID_FIELD: { status: 400, data: z.object({ fieldId: z.string() }) },
  INVALID_FIELD_VALUE: { status: 400, data: z.object({ fieldId: z.string() }) },
  INVALID_FIELD_GROUP: { status: 400, data: z.object({ groupId: z.string() }).optional() },
  FIELD_IN_USE: { status: 409, data: z.object({ fieldId: z.string() }).optional() },

  // Products.
  INVALID_CATEGORY: { status: 400 },
  CATEGORY_HAS_CHILDREN: { status: 409 },
  INVALID_PRODUCT: { status: 400 },
  PLUGIN_NOT_INSTALLED: { status: 400 },

  // Files.
  FILE_TOO_LARGE: { status: 400, data: z.object({ maxSizeMb: z.number() }) },
  FILE_TYPE_NOT_ALLOWED: { status: 400, data: z.object({ allowedTypes: z.array(z.string()) }) },
  UPLOAD_INCOMPLETE: { status: 409 },
  UPLOAD_CHANGED: { status: 409 },
  // Signed upload links of the local driver (files.http.ts).
  CONTENT_TYPE_MISMATCH: { status: 400 },
  SIZE_MISMATCH: { status: 400 },
  ALREADY_UPLOADED: { status: 409 },

  // Payments.
  CURRENCY_NOT_SUPPORTED: { status: 400, data: z.object({ currency: z.string() }) },
  DEFAULT_NOT_ALLOWED: { status: 400 },
  GATEWAY_NOT_ALLOWED: { status: 403 },
  GATEWAY_REFUSED: { status: 400 },
  GATEWAY_IN_USE: { status: 409 },
  KIND_CHANGED: { status: 400 },
  NO_GATEWAY: { status: 400 },
  NOT_PENDING: { status: 409 },
  NOT_TEST: { status: 400 },
  LINES_MISMATCH: { status: 400 },
  NOT_REFUNDABLE: { status: 409 },
  PARTIAL_NOT_SUPPORTED: { status: 409 },

  // erxes.io: workspaces and sign-in links (saas.http.ts).
  OWNER_REQUIRED: { status: 400 },
  TOKEN_USED: { status: 400 },
  NOT_A_MEMBER: { status: 403 },

  // Plugins, organisations, roles.
  INVALID_CLIENT: { status: 401 },
  NOT_INSTALLED: { status: 403 },
  NAMESPACE_REQUIRED: { status: 400 },
  PLUGIN_NOT_FOUND: { status: 404 },
  INVALID_SUBDOMAIN: { status: 400 },
  UNKNOWN_PERMISSION: { status: 400, data: Permissions },
  DUPLICATE_PERMISSION_SET: { status: 400 },
  OWNER_ONLY_PERMISSION: { status: 400, data: Permissions },
  BEYOND_OWN_PERMISSIONS: { status: 403, data: Permissions.optional() },
  ROLE_NOT_FOUND: { status: 404 },
  FIXED_ROLE: { status: 403 },
  BUILTIN_ROLE: { status: 403 },
  ROLE_IN_USE: { status: 409 },

  API_REQUIRED: { status: 400 },

  ASSISTANT_INVALID_MESSAGE: { status: 400, data: InvalidInput.optional() },
  ASSISTANT_MENTION_UNAVAILABLE: {
    status: 400,
    data: z.object({ type: z.string(), id: z.string() }),
  },
  ASSISTANT_FILE_UNAVAILABLE: { status: 400, data: z.object({ id: z.string() }) },
  ASSISTANT_FILE_UNREADABLE: {
    status: 400,
    data: z.object({ id: z.string(), reason: z.string() }),
  },
  ASSISTANT_FILE_TYPE_NOT_SUPPORTED: {
    status: 400,
    data: z.object({ id: z.string(), contentType: z.string() }),
  },
  ASSISTANT_FILE_TOO_LARGE: {
    status: 400,
    data: z.object({ id: z.string(), maxSizeMb: z.number() }),
  },
  ASSISTANT_FILE_BUSY: { status: 429, data: z.object({ id: z.string() }) },
  ASSISTANT_NO_CONNECTION: { status: 400 },
  ASSISTANT_KEY_UNREADABLE: { status: 400 },
  ASSISTANT_BUSY: { status: 409 },
  ASSISTANT_STALE: { status: 409 },
  ASSISTANT_NOTHING_TO_CONTINUE: { status: 400 },

  // Import and export.
  UNSUPPORTED_FILE: { status: 400 },
  INVALID_COLUMNS: { status: 400 },
  INVALID_MAPPING: { status: 400 },
  INVALID_OPTIONS: { status: 400 },
  IMPORT_LOCKED: { status: 409 },
  NOT_UNDOABLE: { status: 409 },
} satisfies ErrorMap;

export type ErrorCode = keyof typeof ERRORS;

const {
  UNAUTHORIZED,
  NOT_ALLOWED,
  PLUGIN_ONLY,
  MEMBERS_ONLY,
  ORG_REQUIRED,
  SCOPE_REQUIRED,
  SERVICE_TOKEN_REQUIRED,
  ORGANIZATION_DISABLED,
  NOT_IN_PLAN,
  READ_ONLY,
  TOO_MANY_REQUESTS,
  INVALID_INPUT,
  NOT_FOUND,
  TAKEN,
  INVALID_CURSOR,
  INVALID_REFERENCE,
  INVALID_FILTER,
  FILTER_TOO_SLOW,
} = ERRORS;

/** What any procedure can answer with: access, standing, input, a missing record, a unique or reference conflict, a list filter. */
export const COMMON_ERRORS = {
  UNAUTHORIZED,
  NOT_ALLOWED,
  PLUGIN_ONLY,
  MEMBERS_ONLY,
  ORG_REQUIRED,
  SCOPE_REQUIRED,
  SERVICE_TOKEN_REQUIRED,
  ORGANIZATION_DISABLED,
  NOT_IN_PLAN,
  READ_ONLY,
  TOO_MANY_REQUESTS,
  INVALID_INPUT,
  NOT_FOUND,
  TAKEN,
  INVALID_CURSOR,
  INVALID_REFERENCE,
  INVALID_FILTER,
  FILTER_TOO_SLOW,
};
