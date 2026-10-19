import { createHash } from 'node:crypto';
import { findContract } from 'erxes-sdk';
import { getPlugins } from 'erxes-api-shared/utils';
import { z } from 'zod';
import type { IModels } from './connectionResolver';
import { ApiError } from './errors';
import { collectionName, dropCollections, ensureIndexes } from './hostDb';
import { LIMITS } from './limits';
import { pluginName, rebuildPermissions } from './permissions';
import { revokeGrants } from './sandbox';

export const InstallBody = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  version: z.string().min(1),
  code: z.string().min(1).max(LIMITS.workerBytes),
  functions: z.array(z.string()),
  collections: z.array(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)),
  permissions: z.record(z.string(), z.record(z.string(), z.string())),
  functionPermissions: z.record(z.string(), z.string()),
  // Only contract versions this runtime serves.
  uses: z
    .record(z.string(), z.number().int())
    .default({})
    .refine(
      (uses) =>
        Object.entries(uses).every(([host, version]) =>
          findContract(host, version),
        ),
      { message: 'pins a host contract version this runtime does not serve' },
    ),
  // Plain ascending or descending keys on top-level fields, optionally
  // unique. installBuild checks each names a declared collection.
  indexes: z
    .record(
      z.string(),
      z
        .array(
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
            })
            .strict(),
        )
        .max(10),
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

// An extension's permission and UI name is its id in camelCase, so `a-1` and
// `a1` would share actions and groups, and `sales` would share the sales
// plugin's. Refuse the second one.
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
    (await getPlugins()).find((plugin) => pluginName(plugin) === name);

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
        functions: build.functions,
        collections: build.collections,
        permissions: build.permissions,
        functionPermissions: build.functionPermissions,
        uses: build.uses ?? {},
        indexes: build.indexes ?? {},
        status: 'installed',
        installedBy: build.installedBy,
        installedAt: new Date(),
        ...(build.uiRemote && { uiRemote: build.uiRemote }),
      },
      ...(!build.uiRemote && { $unset: { uiRemote: '' } }),
    },
    { upsert: true },
  );

  await rebuildPermissions(models, tenant);

  return previous?.version ?? null;
};

// A version, once installed, keeps its code forever: workerd caches a loaded
// worker by version, and browsers cache UI files by version for a year. Its
// record outlives uninstall, so reinstalling the identical build reactivates
// it and different code under the same version is refused.
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

  if (strays.length > 0) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      `indexes name collections ${id} doesn't declare: ${strays.join(', ')}`,
    );
  }
  const existing = await models.ExtensionVersions.findById(_id).lean();

  if (existing) {
    if (existing.codeHash !== sha256(code)) {
      throw new ApiError(
        409,
        'VERSION_EXISTS',
        `${id}@${version} was installed before with different code. Bump the version.`,
      );
    }

    const previous = await activateVersion(models, tenant, id, version);
    return { id, version, previous, reactivated: true };
  }

  await assertNameIsFree(models, tenant, id);

  if (ui) {
    // No version record yet, so leftover assets of this version are from an
    // install that failed half way; clear them or the retry hits duplicates.
    await models.ExtensionAssets.deleteMany({
      subdomain: tenant,
      extId: id,
      version,
    });
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
    functions: body.functions,
    collections: body.collections,
    permissions: body.permissions,
    functionPermissions: body.functionPermissions,
    uses: body.uses,
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

export const RunsQuery = z.object({
  status: z.enum(['ok', 'error', 'timeout']).optional(),
  // ISO date: runs before it, for the next page.
  before: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

// Newest first. Records expire after 30 days.
export const listRuns = async (
  models: IModels,
  tenant: string,
  extId: string,
  { status, before, limit }: z.infer<typeof RunsQuery>,
) =>
  models.ExtensionRuns.find({
    subdomain: tenant,
    extId,
    ...(status && { status }),
    ...(before && { createdAt: { $lt: new Date(before) } }),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
