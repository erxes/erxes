import { GraphQLSchema } from 'graphql';
import {
  DATA_EXTENSION_RECORD_TYPES,
  DATA_EXTENSIONS_ENGINE_VERSION,
  getDataExtensionSchemaVersion,
  IDataExtensionModels,
  IDataExtensionRecordType,
  loadDataExtensionSnapshot,
} from 'erxes-api-shared/core-modules';
import { isEnabled } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { ownerResolvers } from '~/modules/data-extensions/runtime/owners';
import { buildTenantSchema } from '~/modules/data-extensions/runtime/schema/buildSchema';
import { recordSchemaBuild } from '~/modules/data-extensions/runtime/metrics';
import { SchemaCache } from '~/modules/data-extensions/runtime/schema/cache';

const readNumber = (name: string, fallback: number) => {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const VERSION_TTL_MS = readNumber('DATA_EXTENSIONS_VERSION_TTL_MS', 1000);
const VERSION_CACHE_MAX = 10000;
const OWNERS_TTL_MS = 30000;

export const schemaCache = new SchemaCache<GraphQLSchema>({
  maxEntries: readNumber('DATA_EXTENSIONS_SCHEMA_CACHE_MAX', 100),
  idleTtlMs: readNumber('DATA_EXTENSIONS_SCHEMA_IDLE_MS', 15 * 60 * 1000),
  maxAgeMs: readNumber('DATA_EXTENSIONS_SCHEMA_MAX_AGE_MS', 10 * 60 * 1000),
  maxConcurrentBuilds: readNumber('DATA_EXTENSIONS_MAX_BUILDS', 4),
  maxQueuedBuilds: readNumber('DATA_EXTENSIONS_MAX_QUEUED_BUILDS', 50),
});

const versions = new Map<string, { version: number; readAt: number }>();

/**
 * The version decides which cached schema serves a request. A short TTL
 * keeps the lookup cheap; owners re-validate every write against current
 * definitions, so a briefly stale schema cannot authorise a retired field.
 */
const getVersion = async (subdomain: string, models: IDataExtensionModels) => {
  const cached = versions.get(subdomain);

  if (cached && Date.now() - cached.readAt < VERSION_TTL_MS) {
    return cached.version;
  }

  const version = await getDataExtensionSchemaVersion(models);

  if (versions.size >= VERSION_CACHE_MAX) {
    versions.clear();
  }

  versions.set(subdomain, { version, readAt: Date.now() });

  return version;
};

let enabledRecordTypes: {
  value: IDataExtensionRecordType[];
  readAt: number;
} | null = null;

const getEnabledRecordTypes = async () => {
  if (
    enabledRecordTypes &&
    Date.now() - enabledRecordTypes.readAt < OWNERS_TTL_MS
  ) {
    return enabledRecordTypes.value;
  }

  const owners = Array.from(
    new Set(DATA_EXTENSION_RECORD_TYPES.map(({ owner }) => owner)),
  );
  const enabled = new Set<string>();

  for (const owner of owners) {
    if (await isEnabled(owner)) {
      enabled.add(owner);
    }
  }

  const value = DATA_EXTENSION_RECORD_TYPES.filter(({ owner }) =>
    enabled.has(owner),
  );

  enabledRecordTypes = { value, readAt: Date.now() };

  return value;
};

export const getTenantSchema = async (
  subdomain: string,
): Promise<GraphQLSchema> => {
  const models = await generateModels(subdomain);
  const version = await getVersion(subdomain, models);
  const recordTypes = await getEnabledRecordTypes();
  const owners = Array.from(new Set(recordTypes.map(({ owner }) => owner)));
  const key = [
    subdomain,
    version,
    DATA_EXTENSIONS_ENGINE_VERSION,
    owners.join('+'),
  ].join(':');

  return schemaCache.get(key, async () => {
    const startedAt = performance.now();

    try {
      const schema = await buildSnapshotSchema();

      recordSchemaBuild(performance.now() - startedAt, false);

      return schema;
    } catch (error) {
      recordSchemaBuild(performance.now() - startedAt, true);
      throw error;
    }
  });

  async function buildSnapshotSchema() {
    const snapshot = await loadDataExtensionSnapshot(models);

    // A publish landed after the version lookup: point later requests at
    // the newer key instead of reusing this one.
    if (snapshot.version !== version) {
      versions.set(subdomain, {
        version: snapshot.version,
        readAt: Date.now(),
      });
    }

    return buildTenantSchema({
      version: snapshot.version,
      recordTypes,
      fields: snapshot.fields,
      owners: ownerResolvers,
    });
  }
};
