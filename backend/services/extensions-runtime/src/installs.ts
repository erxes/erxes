import { createHash } from 'node:crypto';
import { getActivePlugins } from 'erxes-api-shared/utils';
import { checkExtensionSchema, pluginName } from 'erxes-sdk';
import { z } from 'zod';
import type { IModels } from './connectionResolver';
import { ApiError } from './errors';
import { summarizeOperation } from './graphql';
import { collectionName, dropCollections, ensureIndexes } from './hostDb';
import { DEV_MODE, LIMITS } from './limits';
import { rebuildPermissions } from './permissions';
import { revokeGrants } from './sandbox';

// sha256 -> document, from the extension's codegen. Refuses a document whose
// hash doesn't match, that isn't one named query or mutation, or that selects
// a root field no extension may use.
export const Operations = z
  .record(z.string().regex(/^sha256:[a-f0-9]{64}$/), z.string())
  .default({})
  .superRefine((operations, ctx) => {
    if (Object.keys(operations).length > LIMITS.maxOperations) {
      ctx.addIssue({
        code: 'custom',
        message: `at most ${LIMITS.maxOperations} operations`,
      });
    }

    for (const [hash, document] of Object.entries(operations)) {
      try {
        summarizeOperation(hash, document);
      } catch (e) {
        ctx.addIssue({
          code: 'custom',
          path: [hash],
          message: e instanceof Error ? e.message : String(e),
        });
      }
    }
  });

export const InstallBody = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  version: z.string().min(1),
  code: z.string().min(1).max(LIMITS.workerBytes),
  // Plugin-style SDL strings. installBuild checks them as one schema.
  graphql: z
    .object({
      types: z.string().default(''),
      queries: z.string().default(''),
      mutations: z.string().default(''),
    })
    .strict(),
  // Type -> the fields the worker has resolvers for.
  resolvers: z.record(z.string(), z.array(z.string())),
  collections: z
    .array(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/))
    .max(LIMITS.maxCollections),
  permissions: z.record(z.string(), z.record(z.string(), z.string())),
  fieldPermissions: z.record(z.string(), z.string()),
  operations: Operations,
  // Plain ascending or descending keys on top-level fields, optionally
  // unique and sparse. installBuild checks each names a declared collection and caps
  // the total.
  indexes: z
    .record(
      z.string(),
      z.array(
        z
          .object({
            keys: z
              .record(
                z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
                z.union([z.literal(1), z.literal(-1)]),
              )
              .refine((keys) => Object.keys(keys).length > 0, {
                message: 'an index needs at least one key',
              }),
            unique: z.boolean().optional(),
            sparse: z.boolean().optional(),
          })
          .strict(),
      ),
    )
    .default({}),
  ui: z
    .object({
      remote: z.string(),
      files: z.record(z.string(), z.string()), // path -> base64
    })
    .optional(),
});

export type InstallBody = z.infer<typeof InstallBody>;

const CONTENT_TYPES: Record<string, string> = {
  js: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  svg: 'image/svg+xml',
  png: 'image/png',
};

const sha256 = (text: string) =>
  createHash('sha256').update(text).digest('hex');

// Object keys sorted at every depth, so the same build always hashes the same.
const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, sortKeys(item)]),
    );
  }

  return value;
};

// A version's identity: everything it installs, from worker code, schema and
// operations to permissions, indexes and UI files.
const buildHash = (body: InstallBody) => sha256(JSON.stringify(sortKeys(body)));

// An extension's permission and UI name is its id in camelCase, so `a-1` and
// `a1` would share actions and groups, and `sales` would share the sales
// plugin's. Refuse the second one. The plugins are the ones the gateway
// published, not this service's own env.
const assertNameIsFree = async (
  models: IModels,
  tenant: string,
  id: string,
) => {
  const name = pluginName(id);
  const others = await models.ExtensionVersions.distinct('extId', {
    subdomain: tenant,
    extId: { $ne: id },
  });
  const taken =
    others.find((other) => pluginName(other) === name) ??
    (await getActivePlugins()).find((plugin) => pluginName(plugin) === name);

  if (taken) {
    throw new ApiError(
      409,
      'NAME_TAKEN',
      `${id} would share the name ${name} with ${taken}. Choose another id.`,
    );
  }
};

// Points the extension at one of its installed builds. Returns the version it
// pointed at before, or null.
export const activateVersion = async (
  models: IModels,
  tenant: string,
  extId: string,
  version: string,
) => {
  const build = await models.ExtensionVersions.findById(
    `${tenant}:${extId}@${version}`,
  ).lean();

  if (!build) {
    throw new ApiError(
      404,
      'NOT_INSTALLED',
      `${extId}@${version} was never installed`,
    );
  }

  // Before the pointer moves, so a version whose indexes can't be built never
  // becomes the active one.
  await ensureIndexes(models.Extensions.db, extId, build.indexes ?? {});

  const previous = await models.Extensions.findById(
    `${tenant}:${extId}`,
  ).lean();

  await models.Extensions.updateOne(
    { _id: `${tenant}:${extId}` },
    {
      $set: {
        subdomain: tenant,
        extId,
        version,
        code: build.code,
        codeHash: build.codeHash,
        buildHash: build.buildHash,
        typeDefs: build.typeDefs,
        resolvers: build.resolvers,
        collections: build.collections,
        permissions: build.permissions,
        fieldPermissions: build.fieldPermissions,
        operations: build.operations ?? {},
        indexes: build.indexes ?? {},
        installedBy: build.installedBy,
        installedAt: new Date(),
        ...(build.uiRemote && { uiRemote: build.uiRemote }),
      },
      // Switching versions keeps a disabled extension disabled.
      $setOnInsert: { status: 'installed' },
      ...(!build.uiRemote && { $unset: { uiRemote: '' } }),
    },
    { upsert: true },
  );

  await rebuildPermissions(models, tenant);

  return previous?.version ?? null;
};

// A version, once installed, keeps its build forever: browsers cache UI files
// by version for a year. Its record outlives uninstall, so reinstalling the
// identical build reactivates it and any other build under the same version
// is refused. In DEV_MODE (`erxes-ext dev`) the other build replaces it.
export const installBuild = async (
  models: IModels,
  tenant: string,
  userId: string,
  body: InstallBody,
) => {
  const { id, version, code, ui } = body;
  const _id = `${tenant}:${id}@${version}`;
  const strays = Object.keys(body.indexes).filter(
    (name) => !body.collections.includes(name),
  );

  const indexCount = Object.values(body.indexes).flat().length;

  if (indexCount > LIMITS.maxIndexes) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      `${id} declares ${indexCount} indexes; at most ${LIMITS.maxIndexes} are allowed`,
    );
  }

  if (strays.length > 0) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      `indexes name collections ${id} doesn't declare: ${strays.join(', ')}`,
    );
  }

  // The name core-ui registers the remote under, and the name its config and
  // permissions use: one per extension, never a plugin's.
  const remote = `${pluginName(id)}_ui`;

  if (ui && ui.remote !== remote) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      `${id}'s UI remote must be named ${remote}, not ${ui.remote}`,
    );
  }

  // The same checks `erxes-ext build` ran: one schema that parses, root
  // fields only, each named after the extension, with a resolver and a
  // declared permission, and no subscriptions.
  const { typeDefs, problems } = checkExtensionSchema(body);

  if (problems.length > 0) {
    throw new ApiError(
      400,
      'INVALID_SCHEMA',
      `${id}'s GraphQL schema is refused: ${problems.join('; ')}`,
      problems.map((message) => ({ path: 'graphql', message })),
    );
  }

  const hash = buildHash(body);
  const existing = await models.ExtensionVersions.findById(_id).lean();

  if (existing && existing.buildHash !== hash && DEV_MODE) {
    await models.ExtensionVersions.deleteOne({ _id });
  } else if (existing) {
    if (existing.buildHash !== hash) {
      throw new ApiError(
        409,
        'VERSION_EXISTS',
        `${id}@${version} was installed before with a different build. Bump the version.`,
      );
    }

    const previous = await activateVersion(models, tenant, id, version);
    return { id, version, previous, reactivated: true };
  }

  await assertNameIsFree(models, tenant, id);

  // No version record now, so leftover assets of this version are from an
  // install that failed half way, or the build a dev reinstall replaces.
  // Clear them or the insert hits duplicates.
  await models.ExtensionAssets.deleteMany({
    subdomain: tenant,
    extId: id,
    version,
  });

  if (ui) {
    await models.ExtensionAssets.insertMany(
      Object.entries(ui.files).map(([path, base64]) => ({
        _id: `${tenant}:${id}@${version}/${path}`,
        subdomain: tenant,
        extId: id,
        version,
        path,
        contentType:
          CONTENT_TYPES[path.split('.').pop() ?? ''] ??
          'application/octet-stream',
        content: Buffer.from(base64, 'base64'),
      })),
    );
  }

  await models.ExtensionVersions.create({
    _id,
    subdomain: tenant,
    extId: id,
    version,
    code,
    codeHash: sha256(code),
    buildHash: hash,
    typeDefs,
    resolvers: body.resolvers,
    collections: body.collections,
    permissions: body.permissions,
    fieldPermissions: body.fieldPermissions,
    operations: body.operations,
    indexes: body.indexes,
    uiRemote: ui?.remote,
    installedBy: userId,
  });

  const previous = await activateVersion(models, tenant, id, version);
  return { id, version, previous, reactivated: false };
};

export const setStatus = async (
  models: IModels,
  tenant: string,
  extId: string,
  status: 'installed' | 'disabled',
) => {
  const { matchedCount } = await models.Extensions.updateOne(
    { _id: `${tenant}:${extId}` },
    { $set: { status } },
  );

  if (matchedCount === 0) {
    throw new ApiError(404, 'NOT_INSTALLED', 'Extension is not installed');
  }

  // Runs in flight lose ctx.db and ctx.gql now, as on uninstall.
  if (status === 'disabled') {
    revokeGrants(tenant, extId);
  }

  await rebuildPermissions(models, tenant);
};

// Uninstall keeps data and builds. Purge also drops every collection any
// installed version declared, so a collection an older version used, and a
// later one dropped or renamed, is not left behind.
export const uninstall = async (
  models: IModels,
  tenant: string,
  extId: string,
  purge: boolean,
) => {
  const ext = await models.Extensions.findById(`${tenant}:${extId}`).lean();

  if (!ext) {
    throw new ApiError(404, 'NOT_INSTALLED', 'Extension is not installed');
  }

  await models.Extensions.deleteOne({ _id: ext._id });
  revokeGrants(tenant, extId);

  if (purge) {
    const versions = await models.ExtensionVersions.find({
      subdomain: tenant,
      extId,
    })
      .select('collections')
      .lean();
    const collections = new Set([
      ...ext.collections,
      ...versions.flatMap((v) => v.collections),
    ]);

    await dropCollections(models.Extensions.db, extId, [...collections]);
  }

  await rebuildPermissions(models, tenant);

  return { id: extId, purged: purge };
};

// Installs without code, with their version history and how many documents
// each collection holds.
export const listInstalled = async (models: IModels, tenant: string) => {
  const exts = await models.Extensions.find({ subdomain: tenant })
    .select('-code')
    .sort({ extId: 1 })
    .lean();

  return Promise.all(
    exts.map(async (ext) => ({
      ...ext,
      versions: await models.ExtensionVersions.find({
        subdomain: tenant,
        extId: ext.extId,
      })
        .select('version installedAt installedBy')
        .sort({ installedAt: -1 })
        .lean(),
      documents: Object.fromEntries(
        await Promise.all(
          ext.collections.map(async (name) => [
            name,
            await models.Extensions.db
              .collection(collectionName(ext.extId, name))
              .estimatedDocumentCount(),
          ]),
        ),
      ),
    })),
  );
};
