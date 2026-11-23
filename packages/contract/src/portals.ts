import { PORTAL_KEY_KINDS } from '@erxes/core-db/enums';
import { customerAccounts, portalKeys, portalPlugins, portals } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

/**
 * Where a portal's pages run, as browsers send it in `Origin`: `https://host[:port]`, or
 * `http://localhost[:port]` while developing.
 */
export const WebOrigin = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .regex(
    /^(https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+|http:\/\/(localhost|127\.0\.0\.1))(:\d{1,5})?$/,
    'a web address: https://shop.example.com or http://localhost:3000',
  );

/** An iOS app's bundle id: `mn.acme.shop`. */
const IosBundleId = z
  .string()
  .trim()
  .max(155)
  .regex(/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/, 'a bundle id: mn.acme.shop');

/** An Android app's package name: `mn.acme.shop`. */
const AndroidPackage = z
  .string()
  .trim()
  .max(150)
  .regex(/^[A-Za-z]\w*(\.[A-Za-z]\w*)+$/, 'a package name: mn.acme.shop');

const listOnce = <T extends z.ZodType<string>>(item: T, max: number) =>
  z
    .array(item)
    .max(max)
    .refine((list) => new Set(list).size === list.length, 'each one once');

const addresses = () => z.array(z.string());

/**
 * A portal customers sign in to (decision 42): a shop, hotel or tour site and its mobile apps.
 * The organisation owns it, plugins attach to it, and it has its own customer accounts.
 */
export const Portal = createSelectSchema(portals, {
  id: Id,
  origins: addresses,
  iosBundleIds: addresses,
  androidPackages: addresses,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  name: true,
  /** Its emails come from this name; null: the portal's name. */
  senderName: true,
  /** Web addresses browsers call from. */
  origins: true,
  /** iOS apps: bundle ids Apple sign-in tokens may name. */
  iosBundleIds: true,
  /** Android apps: package names. */
  androidPackages: true,
  emailSignIn: true,
  phoneSignIn: true,
  /** A verify.mn connection: customers text the code. Null: core texts it to them. */
  phoneConnectionId: true,
  googleConnectionId: true,
  appleConnectionId: true,
  facebookConnectionId: true,
  createdAt: true,
  updatedAt: true,
});

export type Portal = z.infer<typeof Portal>;

/** A plugin's record on a portal, such as an ecommerce store. */
export const PortalPlugin = createSelectSchema(portalPlugins, { createdAt: isoDate }).pick({
  portalId: true,
  plugin: true,
  recordId: true,
  createdAt: true,
});

export type PortalPlugin = z.infer<typeof PortalPlugin>;

/** A portal with its plugins and how many customers have an account on it. */
export const PortalListItem = Portal.extend({
  plugins: z.array(z.string()),
  accounts: z.int(),
});

export type PortalListItem = z.infer<typeof PortalListItem>;

/** A portal's customer key, without its secret. */
/**
 * A customer key's kind: `secret` for the portal's own server (shown once), `publishable` for
 * its web and mobile apps (ships inside them, shown any time; browsers only from the portal's
 * web addresses). Both reach the same routes; plugins limit a publishable key's calls per visitor.
 */
export const PortalKeyKind = z.enum(PORTAL_KEY_KINDS);

export type PortalKeyKind = z.infer<typeof PortalKeyKind>;

export const PortalKey = createSelectSchema(portalKeys, {
  id: Id,
  kind: PortalKeyKind,
  createdAt: isoDate,
  lastUsedAt: isoDate,
}).pick({
  id: true,
  portalId: true,
  name: true,
  kind: true,
  /** A publishable key whole; null for a secret key. */
  key: true,
  /** The secret's last 4 characters. */
  hint: true,
  createdBy: true,
  createdAt: true,
  lastUsedAt: true,
});

export type PortalKey = z.infer<typeof PortalKey>;

const connection = (id: z.ZodString) => id.min(1).max(64);

const PortalName = z.string().trim().min(1).max(200);

const PortalFields = createUpdateSchema(portals, {
  name: () => PortalName,
  senderName: (name) => name.trim().min(1).max(100),
  origins: () => listOnce(WebOrigin, 20),
  iosBundleIds: () => listOnce(IosBundleId, 10),
  androidPackages: () => listOnce(AndroidPackage, 10),
  phoneConnectionId: connection,
  googleConnectionId: connection,
  appleConnectionId: connection,
  facebookConnectionId: connection,
}).pick({
  name: true,
  senderName: true,
  origins: true,
  iosBundleIds: true,
  androidPackages: true,
  emailSignIn: true,
  phoneSignIn: true,
  phoneConnectionId: true,
  googleConnectionId: true,
  appleConnectionId: true,
  facebookConnectionId: true,
});

/** A customer's sign-up on one portal, as staff see it. */
export const CustomerAccount = createSelectSchema(customerAccounts, {
  id: Id,
  createdAt: isoDate,
  lastSignedInAt: isoDate,
})
  .pick({
    id: true,
    portalId: true,
    customerId: true,
    createdAt: true,
    lastSignedInAt: true,
  })
  .extend({
    portalName: z.string(),
    /** What it signs in with: emails, phones, and Google, Apple or Facebook. */
    logins: z.array(z.string()),
    /** Devices and browsers signed in now. */
    sessions: z.int(),
  });

export type CustomerAccount = z.infer<typeof CustomerAccount>;

const { UNKNOWN_PORTAL, UNKNOWN_CONNECTION } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, UNKNOWN_PORTAL, UNKNOWN_CONNECTION });

const ok = z.object({ ok: z.literal(true) });

const portalId = z.object({ id: Id });

/**
 * Portals: members add and set them up in Settings › Portals; plugins attach their records
 * (a store, a site) and serve the portal's customers.
 */
export const portalsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/portals',
      summary: 'List portals',
      description:
        'Portals customers sign in to, by name, with their plugins and accounts. Plugins with `portals:write` see them all, to attach to one',
    })
    .output(listOf(PortalListItem)),
  get: base
    .route({
      method: 'GET',
      path: '/portals/{id}',
      summary: 'Get a portal',
      description: 'A portal with its plugins and accounts. 404 NOT_FOUND',
    })
    .input(portalId)
    .output(PortalListItem),
  create: base
    .route({
      method: 'POST',
      path: '/portals',
      successStatus: 201,
      summary: 'Add a portal',
      description:
        'Add a portal customers sign in to. A connection must be one of the right integration. 400 UNKNOWN_CONNECTION',
    })
    .input(PortalFields.required({ name: true }))
    .output(Portal),
  update: base
    .route({
      method: 'PATCH',
      path: '/portals/{id}',
      summary: 'Change a portal',
      description:
        'Change its name, addresses, apps and how customers sign in (`null` turns a connection off). 400 UNKNOWN_CONNECTION, 404 NOT_FOUND',
    })
    .input(PortalFields.extend(portalId.shape))
    .output(Portal),
  remove: base
    .route({
      method: 'DELETE',
      path: '/portals/{id}',
      summary: 'Delete a portal',
      description:
        'Delete a portal with its customer accounts and customer keys; customers stay. 404 NOT_FOUND',
    })
    .input(portalId)
    .output(ok),
  save: base
    .route({
      method: 'PUT',
      path: '/portals/records/{recordId}',
      summary: "Add or change a record's portal",
      description:
        "Plugins only: the portal one of the plugin's records runs (a content site), made the first time and renamed after. Its id goes in sign-in calls",
    })
    .input(
      z.object({
        recordId: Id,
        name: PortalName,
        origins: listOnce(WebOrigin, 20),
      }),
    )
    .output(Portal),
  attach: base
    .route({
      method: 'PUT',
      path: '/portals/{id}/plugins/{recordId}',
      summary: 'Attach a record to a portal',
      description:
        "Plugins only: put one of the plugin's records (a store) on a portal another plugin or a member made. A record is on one portal, a portal has one record per plugin. 404 NOT_FOUND",
    })
    .input(portalId.extend({ recordId: Id }))
    .output(PortalPlugin),
  detach: base
    .route({
      method: 'DELETE',
      path: '/portals/records/{recordId}',
      summary: 'Take a record off its portal',
      description:
        "Plugins only: take one of the plugin's records off its portal. The portal and its accounts stay. 400 UNKNOWN_PORTAL",
    })
    .input(z.object({ recordId: Id }))
    .output(ok),
  keys: base
    .route({
      method: 'GET',
      path: '/portals/keys',
      summary: 'List customer keys',
      description:
        "Every portal's customer keys (Settings › API keys), newest first, without their secrets",
    })
    .output(listOf(PortalKey.extend({ portalName: z.string() }))),
  createKey: base
    .route({
      method: 'POST',
      path: '/portals/{id}/keys',
      successStatus: 201,
      summary: 'Make a customer key',
      description:
        "A customer key, traded at `POST /portal-auth/token` for a token the portal's plugins accept, for what customers and visitors may see. `secret` (the default) is for the portal's own server and shows once; `publishable` is for its web and mobile apps and shows any time. 404 NOT_FOUND",
    })
    .input(
      portalId.extend({
        name: z.string().trim().min(1).max(100),
        kind: PortalKeyKind.default('secret'),
      }),
    )
    .output(PortalKey.extend({ secret: z.string() })),
  removeKey: base
    .route({
      method: 'DELETE',
      path: '/portals/{id}/keys/{keyId}',
      summary: 'Revoke a customer key',
      description:
        'Revoke a customer key: its tokens stop working within 15 minutes. 404 NOT_FOUND',
    })
    .input(portalId.extend({ keyId: Id }))
    .output(ok),
};

/**
 * Staff see a customer's accounts on the organisation's portals. Only the customer signs
 * their account out (`/customer/me/*`); staff don't act on it.
 */
export const customerAccountsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/customers/{customerId}/accounts',
      summary: 'List a customer’s accounts',
      description: "A customer's accounts, one per portal they signed up on",
    })
    .input(z.object({ customerId: Id }))
    .output(listOf(CustomerAccount)),
};

const { INVALID_TOKEN, ORIGIN_NOT_ALLOWED } = ERRORS;

/** A portal's server or app trades its customer key for a token every attached plugin checks. */
export const portalAuthContract = {
  token: oc
    .errors({ ...COMMON_ERRORS, INVALID_TOKEN, ORIGIN_NOT_ALLOWED })
    .route({
      method: 'POST',
      path: '/portal-auth/token',
      summary: 'Get a portal token',
      description:
        "Trade a portal's customer key for a 15-minute token (`typ: portal+jwt`) to send to its plugins as `X-Portal-Token`. A secret key works from a server only (a call with `Origin` is refused); a publishable key works from the portal's web addresses, its mobile apps and servers. 401 INVALID_TOKEN, 403 ORIGIN_NOT_ALLOWED",
    })
    .input(z.object({ key: z.string().min(1).max(200) }))
    .output(
      z.object({
        accessToken: z.string(),
        expiresIn: z.int(),
        portalId: z.string(),
      }),
    ),
};
