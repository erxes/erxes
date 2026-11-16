import type { OpenAPI } from '@orpc/openapi';
import type { RequestHandler } from 'express';
import { coreOpenApi, dropUnreferenced } from '~/rpc';
import { SESSION_COOKIE } from './cookies';
import { ACCESS, type Policy } from './policies';

/**
 * Who a reference is for: team members (the session cookie or a member token) or
 * signed-in customers (a customer token). Plugins read the whole document. The
 * cookie is described, not declared as a scheme: a client that fills a cookie
 * scheme in would overwrite the member's own session.
 */
export type ApiAudience = 'member' | 'customer';

const POLICIES = new Map<string, Policy>(Object.entries(ACCESS));

const METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;

/** Whose reference lists a procedure; `plugins.token` is a plugin's own sign-in. */
const audienceOf = (procedure: string, policy: Policy): ApiAudience | undefined => {
  if ('customer' in policy) return 'customer';

  if ('public' in policy) {
    if (procedure.startsWith('customerAuth.')) return 'customer';

    return procedure.startsWith('plugins.') ? undefined : 'member';
  }

  return policy.member ? 'member' : undefined;
};

/** `customerAccount.me` → `Customer account`: the procedure's group, as the reference's section. */
const sectionOf = (procedure: string) => {
  const words = (procedure.split('.')[0] ?? procedure).replaceAll(/([A-Z])/g, ' $1').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};

const BEARER = { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } as const;

const INTROS: Record<ApiAudience, Pick<OpenAPI.Document, 'info' | 'components' | 'security'>> = {
  member: {
    info: {
      title: 'erxes team member API',
      version: 'v1',
      description: `What a signed-in team member can call. Scripts send a member token as \`Authorization: Bearer\`; erxes' own pages, and calls tried here, send the \`${SESSION_COOKIE}\` session cookie instead. Each call also needs the permission its role must hold.`,
    },
    components: {
      securitySchemes: { memberToken: { ...BEARER, description: 'A member access token' } },
    },
    security: [{ memberToken: [] }],
  },
  customer: {
    info: {
      title: 'erxes customer API',
      version: 'v1',
      description:
        'What a customer can call from a portal or app: sign in with a code sent by email or SMS, then use the access token from `POST /customer-auth/sign-in` as `Authorization: Bearer`.',
    },
    components: {
      securitySchemes: {
        customerToken: { ...BEARER, description: 'A customer access token' },
      },
    },
    security: [{ customerToken: [] }],
  },
};

/** The operations of one path item that `audience` may call, filed under their section. */
const operationsFor = (item: OpenAPI.PathItemObject | undefined, audience: ApiAudience) => {
  const kept: OpenAPI.PathItemObject = {};

  for (const method of METHODS) {
    const operation = item?.[method];
    const procedure = operation?.operationId ?? '';
    const policy = POLICIES.get(procedure);

    if (operation && policy && audienceOf(procedure, policy) === audience) {
      kept[method] = {
        ...operation,
        tags: [sectionOf(procedure)],
        ...('public' in policy ? { security: [] } : {}),
      };
    }
  }

  return kept;
};

const buildReference = async (audience: ApiAudience): Promise<OpenAPI.Document> => {
  const whole = await coreOpenApi();
  const intro = INTROS[audience];

  const paths = Object.fromEntries(
    Object.entries(whole.paths ?? {}).flatMap(([path, item]) => {
      const kept = operationsFor(item, audience);

      return Object.keys(kept).length > 0 ? [[path, kept]] : [];
    }),
  );

  const doc: OpenAPI.Document = {
    ...whole,
    ...intro,
    paths,
    components: { ...whole.components, ...intro.components },
  };

  dropUnreferenced(doc);

  return doc;
};

const references = new Map<ApiAudience, Promise<OpenAPI.Document>>();

/** The OpenAPI document of what `audience` can call (`GET /core/v1/openapi/<audience>.json`). */
export const apiReference =
  (audience: ApiAudience): RequestHandler =>
  async (_req, res) => {
    const reference = references.get(audience) ?? buildReference(audience);

    references.set(audience, reference);
    res.json(await reference);
  };
