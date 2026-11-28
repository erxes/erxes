import type { OpenAPI } from '@orpc/openapi';
import type { RequestHandler } from 'express';
import { coreOpenApi, dropUnreferenced } from '~/rpc';
import { SESSION_COOKIE } from './cookies';
import { ACCESS } from './policies';
import type { Policy } from './policyRules';

/**
 * Who a reference is for: team members (the session cookie or a member token) or a portal's
 * apps and server (its portal token, and a signed-in customer's token on `/portal/me`). Plugins read the whole document. The
 * cookie is described, not declared as a scheme: a client that fills a cookie
 * scheme in would overwrite the member's own session.
 */
export type ApiAudience = 'member' | 'portal';

const POLICIES = new Map<string, Policy>(Object.entries(ACCESS));

/** Public procedures a portal calls with its own token: sign-in and the contact form. */
const takesPortalToken = (procedure: string) =>
  procedure.startsWith('customerAuth.') || procedure.startsWith('portalContact.');

const METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;

/** Whose reference lists a procedure; `plugins.token` is a plugin's own sign-in. */
const audienceOf = (procedure: string, policy: Policy): ApiAudience | undefined => {
  if ('customer' in policy) return 'portal';

  if ('public' in policy) {
    if (takesPortalToken(procedure) || procedure.startsWith('portalAuth.')) {
      return 'portal';
    }

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
      description: `What a signed-in team member can call. Scripts send an API key (Settings › Developer › API keys) as \`Authorization: Bearer\`; it acts as the member who made it. erxes' own pages, and calls tried here, send the \`${SESSION_COOKIE}\` session cookie instead. Each call also needs the permission the member's role holds.`,
    },
    components: {
      securitySchemes: {
        memberToken: { ...BEARER, description: 'An API key, or a member access token' },
      },
    },
    security: [{ memberToken: [] }],
  },
  portal: {
    info: {
      title: 'erxes portal API',
      version: 'v1',
      description:
        "What a portal's web and mobile apps (a publishable key) and its server (a secret key) call in core: trade the portal key at `POST /portal-auth/token` for a 15-minute token and send it as `X-Portal-Token`, sign customers in with a code sent by email or SMS or with Google, Apple or Facebook, then send the customer's access token as `Authorization: Bearer` too on `/portal/me`. Each plugin on the portal has its own portal API at `/portal/v1`.",
    },
    components: {
      securitySchemes: {
        portalToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-portal-token',
          description: "A 15-minute token for one of the portal's keys (`POST /portal-auth/token`)",
        },
        customerToken: { ...BEARER, description: 'A customer access token' },
      },
    },
    security: [{ portalToken: [], customerToken: [] }],
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
        // Signing in and the contact form take the portal's token only; the trade itself takes neither.
        ...('public' in policy
          ? { security: takesPortalToken(procedure) ? [{ portalToken: [] }] : [] }
          : {}),
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
