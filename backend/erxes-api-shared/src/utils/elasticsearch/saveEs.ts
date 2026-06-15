import {
  client,
  generateElkId,
  getEsIndexByContentType,
  getIndexPrefix,
} from './utils';
import { getEnv } from '../utils';

/**
 * Write-side Elasticsearch helpers for point-in-time revert.
 *
 * Normally entity indices are filled by the external elkSyncer (an oplog
 * tailer): there is NO in-process Mongo->ES pipeline. A model-layer revert
 * therefore does not auto-sync ES, so these helpers mirror the reverted write
 * into the entity index explicitly. They are gated on isUsingElk(): when the
 * syncer is disabled, ES is not the source of truth and these become no-ops.
 *
 * The document index/id resolution reuses the same primitives the read path
 * uses (getEsIndexByContentType + getIndexPrefix via the client default index
 * prefix; generateElkId for saas id namespacing).
 */

const isUsingElk = (): boolean => {
  const ELK_SYNCER = getEnv({ name: 'ELK_SYNCER', defaultValue: 'true' });
  return ELK_SYNCER !== 'false';
};

/** Resolve the prefixed ES index for a contentType, or null when not indexed. */
const resolveEsIndex = async (contentType: string): Promise<string | null> => {
  const esIndex = await getEsIndexByContentType(contentType);
  if (!esIndex) {
    return null;
  }
  // getIndexPrefix derives the db-name prefix from the mongo connection string,
  // matching how the read path (fetchEs) names indices.
  const connectionString = getEnv({ name: 'MONGO_URL' });
  return `${getIndexPrefix(connectionString)}${esIndex}`;
};

/**
 * Upsert a single document into its entity index. No-op when ELK is disabled
 * or the contentType has no resolvable ES index.
 */
export const saveEsDoc = async (args: {
  subdomain: string;
  contentType: string;
  _id: string;
  document: Record<string, unknown>;
}): Promise<boolean> => {
  const { subdomain, contentType, _id, document } = args;

  if (!isUsingElk()) {
    return false;
  }

  const index = await resolveEsIndex(contentType);
  if (!index) {
    return false;
  }

  const id = await generateElkId(_id, subdomain);

  // Strip Mongo's _id from the body; ES carries it as the document id.
  const { _id: _omit, ...body } = document;

  await client.index({
    index,
    id,
    body,
    refresh: true,
  });

  return true;
};

/**
 * Remove a single document from its entity index. No-op when ELK is disabled
 * or the contentType has no resolvable ES index. A missing document is treated
 * as success (the desired post-state — absent — already holds).
 */
export const deleteEsDoc = async (args: {
  subdomain: string;
  contentType: string;
  _id: string;
}): Promise<boolean> => {
  const { subdomain, contentType, _id } = args;

  if (!isUsingElk()) {
    return false;
  }

  const index = await resolveEsIndex(contentType);
  if (!index) {
    return false;
  }

  const id = await generateElkId(_id, subdomain);

  try {
    await client.delete({
      index,
      id,
      refresh: true,
    });
  } catch (e) {
    // A 404 (already absent) is the intended end state — swallow it; re-throw
    // anything else so a genuine ES failure surfaces to the revert orchestrator.
    const statusCode = (e as { meta?: { statusCode?: number } })?.meta
      ?.statusCode;
    if (statusCode !== 404) {
      throw e;
    }
  }

  return true;
};
