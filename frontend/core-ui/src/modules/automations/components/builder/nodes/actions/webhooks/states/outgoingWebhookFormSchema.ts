import {
  JWT_AUTH_ALGORITHMS,
  OUTGOIN_WEBHOOK_RETRY_BACKOFFS,
  OUTGOING_WEBHOOK_AUTH_PLACEMENTS,
} from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  validHostnameRegex,
  validIpAddressRegex,
} from '@/automations/components/builder/nodes/actions/webhooks/constants/validateRegexes';
import { AUTOMATION_INCOMING_WEBHOOK_API_METHODS } from '@/automations/components/builder/nodes/triggers/webhooks/constants/incomingWebhook';
import { z } from 'zod';

const replaceWebhookPlaceholdersForValidation = (value: string) => {
  let cursor = 0;
  let normalized = '';

  while (cursor < value.length) {
    const placeholderStart = value.indexOf('{{', cursor);

    if (placeholderStart === -1) {
      normalized += value.slice(cursor);
      break;
    }

    const placeholderEnd = value.indexOf('}}', placeholderStart + 2);

    if (placeholderEnd === -1) {
      normalized += value.slice(cursor);
      break;
    }

    normalized += `${value.slice(cursor, placeholderStart)}placeholder`;
    cursor = placeholderEnd + 2;
  }

  return normalized;
};

const isValidOutgoingWebhookUrl = (value: string) => {
  if (!value?.trim()) {
    return false;
  }

  const normalizedValue = replaceWebhookPlaceholdersForValidation(value);

  try {
    const parsed = new URL(normalizedValue);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const basicAuthSchema = z.object({
  type: z.literal('basic'),
  username: z.string(),
  password: z.string(),
});

const bearerAuthSchema = z.object({
  type: z.literal('bearer'),
  token: z.string(),
});

const noneAuthSchema = z.object({
  type: z.literal('none'),
});

const jwtAuthSchema = z.object({
  type: z.literal('jwt'),

  // Algorithm choice (common JWT signing algos)
  algorithm: z.enum(JWT_AUTH_ALGORITHMS),

  // Secret for symmetric (HS*) or private key for asymmetric (RS*/ES*/PS*)
  secretKey: z.string().min(1, 'Secret key is required'),

  // Optional public key (for verification in case of RS/ES/PS)
  publicKey: z.string().optional(),

  // JWT claims (optional, dynamic fields for enterprise systems)
  claims: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .default({}),

  // Token expiration handling
  expiresIn: z.string().default('1h'), // enterprise default: 1 hour

  // Audience & issuer (common in enterprise setups)
  audience: z.string().optional(),
  issuer: z.string().optional(),

  // Header customization
  header: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
  placement: z.enum(OUTGOING_WEBHOOK_AUTH_PLACEMENTS).default('header'),
});

//Auth Schema

const authSchema = z.discriminatedUnion('type', [
  noneAuthSchema,
  basicAuthSchema,
  bearerAuthSchema,
  jwtAuthSchema,
]);

//Headers Schema

const headerSchema = z.object({
  key: z.string().default(''),
  value: z.string().default(''),
});

//Proxy Schema

const proxySchema = z
  .object({
    host: z
      .string()
      .optional()
      .refine((host) => {
        if (!host) return true;
        return validIpAddressRegex.test(host) || validHostnameRegex.test(host);
      }, 'Invalid hostname format'),
    port: z
      .number()
      .int()
      .refine(
        (val) =>
          val === undefined ||
          (Number.isInteger(val) && val >= 1000 && val <= 9999),
        { message: 'Port must be an integer between 1000 and 9999' },
      )
      .optional(),
    auth: z
      .object({
        username: z.string().optional(),
        password: z.string().optional(),
      })
      .optional(),
  })
  .optional()
  .superRefine((proxy, ctx) => {
    if (!proxy) return true;

    // Check if host is provided
    if (proxy.host && !proxy.port) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Proxy port is required when host is provided',
        path: ['port'],
      });
    }

    // Check if port is provided
    if (proxy.port && !proxy.host) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Proxy host is required when port is provided',
        path: ['host'],
      });
    }

    // Check if username is provided
    if (proxy.auth?.username && !proxy.auth?.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Proxy password is required when username is provided',
        path: ['auth', 'password'],
      });
    }

    // Check if password is provided
    if (proxy.auth?.password && !proxy.auth?.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Proxy username is required when password is provided',
        path: ['auth', 'username'],
      });
    }
  });

//Options Schema

const optionsSchema = z.object({
  // Core options
  timeout: z.coerce.number().default(10000).optional(),
  ignoreSSL: z.boolean().default(false),
  followRedirect: z.boolean().default(false),
  maxRedirects: z.coerce.number().optional(),

  // Retry behavior
  retry: z
    .object({
      attempts: z.coerce.number().max(10).default(0), // 0 = no retry
      delay: z.coerce.number().max(60000).default(1000), // in ms
      backoff: z.enum(OUTGOIN_WEBHOOK_RETRY_BACKOFFS).default('none'),
    })
    .default({ attempts: 0, delay: 1000, backoff: 'none' }),

  // Networking
  proxy: proxySchema,
});

// Query Params Schema

const outgoingWebhookQueryParamsSchema = z.object({
  name: z.string().default(''),
  value: z.string().default(''),
});

export const outgoingWebhookFormSchema = z.object({
  method: z
    .enum(AUTOMATION_INCOMING_WEBHOOK_API_METHODS as [string, ...string[]])
    .default('POST'),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(isValidOutgoingWebhookUrl, {
      message: 'Enter a valid HTTP or HTTPS URL',
    }),
  queryParams: z.array(outgoingWebhookQueryParamsSchema).default([]),
  bodyMode: z.enum(['json', 'text']).default('json'),
  body: z.string().default(''),
  auth: authSchema.optional(),
  headers: z.array(headerSchema).default([]),

  options: optionsSchema
    .default({
      followRedirect: true,
      retry: { attempts: 0, delay: 1000, backoff: 'none' },
    })
    .superRefine((opts, ctx) => {
      if (opts.followRedirect && opts.maxRedirects === undefined) {
        ctx.addIssue({
          path: ['maxRedirects'],
          code: z.ZodIssueCode.custom,
          message: 'maxRedirects is required when followRedirect is true',
        });
      }
    }),
});

export type TOutgoingWebhookForm = z.infer<typeof outgoingWebhookFormSchema>;
export type TOutgoingWebhookAuth = z.infer<typeof authSchema>;
