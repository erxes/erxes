import { Model } from 'mongoose';
import { isSealedSecret, sealSecret } from '@/agents/secretBox';
import type { IAiAgentConnection } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { agentsConnectionSchema } from '@/agents/db/definitions/connection';
import {
  AGENTS_ORGANIZATION_OWNER_ID,
  IAgentsConnectionEntry,
  IAgentsConnections,
  IAgentsConnectionsDocument,
  IAgentsEffectiveConnections,
} from '@/agents/@types/connection';

export interface IAgentsConnectionModel
  extends Model<IAgentsConnectionsDocument> {
  /**
   * Returns the acting user's stored connections document (with the legacy
   * single-connection shape normalized into the array), or null when they
   * have not saved any provider yet.
   */
  getConnections(userId: string): Promise<IAgentsConnectionsDocument | null>;
  getEffectiveConnections(userId: string): Promise<IAgentsEffectiveConnections>;
  /**
   * Inserts or replaces the entry for one provider in the acting user's
   * connections array, creating the document on the first save.
   */
  upsertConnection(
    userId: string,
    provider: string,
    connection: IAiAgentConnection,
  ): Promise<IAgentsConnectionsDocument>;
  /**
   * Removes one provider's entry from the acting user's connections array
   * and deletes the document when the array becomes empty.
   */
  removeConnection(userId: string, provider: string): Promise<void>;
  /**
   * Marks one of the acting user's saved providers as the server default, or
   * clears the explicit default when `provider` is empty. Returns null when
   * the provider is not one of the user's saved connections.
   */
  setDefaultProvider(
    userId: string,
    provider: string,
  ): Promise<IAgentsConnectionsDocument | null>;
}

/**
 * The connection an unselected chat turn runs on: the explicit
 * `defaultProvider` while that provider is still saved, otherwise the first
 * saved entry (the behaviour every document had before defaults existed).
 */
export const findDefaultConnection = <
  T extends IAgentsConnectionEntry = IAgentsConnectionEntry,
>(
  doc: { connections?: T[]; defaultProvider?: string } | null,
): T | undefined => {
  const connections = doc?.connections ?? [];

  return (
    connections.find(
      (connection) =>
        Boolean(doc?.defaultProvider) &&
        connection.provider === doc?.defaultProvider,
    ) ?? connections[0]
  );
};

export const toEffectiveConnections = (
  own: Pick<IAgentsConnections, 'connections' | 'defaultProvider'> | null,
  organization: Pick<
    IAgentsConnections,
    'connections' | 'defaultProvider'
  > | null,
): IAgentsEffectiveConnections => {
  const privateEntries = own?.connections ?? [];
  const privateProviders = new Set(
    privateEntries.map((entry) => entry.provider),
  );

  return {
    connections: [
      ...privateEntries.map((entry) => ({
        ...entry,
        scope: 'private' as const,
      })),
      ...(organization?.connections ?? [])
        .filter((entry) => !privateProviders.has(entry.provider))
        .map((entry) => ({ ...entry, scope: 'organization' as const })),
    ],
    defaultProvider: privateEntries.length
      ? findDefaultConnection(own)?.provider
      : findDefaultConnection(organization)?.provider,
  };
};

/**
 * Documents written by the previous single-connection shape carry a legacy
 * top-level `connection` field; normalize them into the array shape so
 * readers never see the old format.
 */
const normalizeConnections = (
  doc: IAgentsConnectionsDocument | null,
): IAgentsConnectionsDocument | null => {
  if (!doc) {
    return null;
  }

  const legacy = (doc as unknown as { connection?: IAgentsConnectionEntry })
    .connection;
  const legacyDoc = doc as unknown as { connection?: unknown };

  if (legacy && !Array.isArray(doc.connections)) {
    doc.connections = [legacy];
  }

  if (Array.isArray(doc.connections) && legacyDoc.connection !== undefined) {
    delete legacyDoc.connection;
  }

  return doc;
};

/**
 * Seals `config.apiKey` in-place when a plaintext value reaches the write
 * path. Sealed values pass through untouched — the keep-stored-key path in
 * `agentsConnectionUpsert` reuses the stored envelope unchanged.
 */
const sealEntryConfig = (entry: IAgentsConnectionEntry): void => {
  const apiKey = entry?.config?.apiKey;

  if (typeof apiKey === 'string' && apiKey.length > 0 && !isSealedSecret(apiKey)) {
    entry.config = { ...entry.config, apiKey: sealSecret(apiKey) };
  }
};

export const loadAgentsConnectionClass = (models: IModels) => {
  class AgentsConnection {
    /**
     * Reads one user's BYOK connections. Tenant isolation is handled by the
     * per-subdomain connection this model is registered on.
     */
    public static async getConnections(
      userId: string,
    ): Promise<IAgentsConnectionsDocument | null> {
      const doc = await models.AgentsConnection.findOne({
        userId,
      }).lean<IAgentsConnectionsDocument>();
      // A single-`connection` document is rewritten into the array shape so
      // its old field (and any plaintext key in it) leaves the database.
      const legacyShape = Boolean(
        doc && (doc as unknown as { connection?: unknown }).connection,
      );

      const normalized = normalizeConnections(doc);

      if (normalized) {
        // Lazy migration: any legacy plaintext key is sealed and written
        // back here so every read path sees envelopes only. Best-effort —
        // a write-back failure never fails the read.
        let migrated = legacyShape;

        for (const entry of normalized.connections ?? []) {
          const apiKey = entry?.config?.apiKey;

          if (
            typeof apiKey === 'string' &&
            apiKey.length > 0 &&
            !isSealedSecret(apiKey)
          ) {
            try {
              entry.config = { ...entry.config, apiKey: sealSecret(apiKey) };
              migrated = true;
            } catch {
              // Secret not configured — read still works via plaintext
              // passthrough in openSecret; migrate on a later read.
            }
          }
        }

        if (migrated) {
          await models.AgentsConnection.updateOne(
            { userId },
            {
              $set: { connections: normalized.connections },
              $unset: { connection: '' },
            },
          ).catch(() => undefined);
        }
      }

      return normalized;
    }

    public static async getEffectiveConnections(
      userId: string,
    ): Promise<IAgentsEffectiveConnections> {
      const [own, organization] = await Promise.all([
        models.AgentsConnection.getConnections(userId),
        userId === AGENTS_ORGANIZATION_OWNER_ID
          ? null
          : models.AgentsConnection.getConnections(
              AGENTS_ORGANIZATION_OWNER_ID,
            ),
      ]);

      return toEffectiveConnections(own, organization);
    }

    /**
     * Inserts or replaces the entry for one provider, persisting the legacy
     * single-connection shape into the array form on the way.
     */
    public static async upsertConnection(
      userId: string,
      provider: string,
      connection: IAiAgentConnection,
    ): Promise<IAgentsConnectionsDocument> {
      const existingDoc = await models.AgentsConnection.findOne({
        userId,
      }).lean<IAgentsConnectionsDocument>();
      const normalized = normalizeConnections(existingDoc);

      const entries: IAiAgentConnection[] = normalized?.connections
        ? [...normalized.connections]
        : [];
      const index = entries.findIndex(
        (entry) => entry.provider === provider,
      );

      // Always seal before persisting — a plaintext key must never reach
      // the database (sealSecret throws when encryption is unconfigured).
      sealEntryConfig(connection);

      if (index >= 0) {
        entries[index] = connection;
      } else {
        entries.push(connection);
      }

      const doc = await models.AgentsConnection.findOneAndUpdate(
        { userId },
        { $set: { connections: entries }, $unset: { connection: '' } },
        { new: true, upsert: true },
      );

      if (!doc) {
        throw new Error('Agents connection not found');
      }

      return doc;
    }

    /**
     * Removes one provider's entry; deletes the whole document when no
     * provider remains configured.
     */
    public static async removeConnection(
      userId: string,
      provider: string,
    ): Promise<void> {
      const existingDoc = await models.AgentsConnection.findOne({
        userId,
      }).lean<IAgentsConnectionsDocument>();
      const normalized = normalizeConnections(existingDoc);

      if (!normalized) {
        return;
      }

      const remaining = normalized.connections.filter(
        (entry) => entry.provider !== provider,
      );

      if (remaining.length === 0) {
        await models.AgentsConnection.deleteOne({ userId });
        return;
      }

      // Removing the default provider falls back to the first remaining
      // entry instead of leaving a dangling default.
      await models.AgentsConnection.findOneAndUpdate(
        { userId },
        {
          $set: { connections: remaining },
          $unset: {
            connection: '',
            ...(normalized.defaultProvider === provider
              ? { defaultProvider: '' }
              : {}),
          },
        },
      );
    }

    /**
     * Sets or clears the explicit default. The provider filter makes the
     * write conditional on that provider still being saved, so a concurrent
     * removal can never leave the default pointing at a missing entry.
     */
    public static async setDefaultProvider(
      userId: string,
      provider: string,
    ): Promise<IAgentsConnectionsDocument | null> {
      if (!provider) {
        return normalizeConnections(
          await models.AgentsConnection.findOneAndUpdate(
            { userId },
            { $unset: { defaultProvider: '' } },
            { new: true },
          ),
        );
      }

      const doc = await models.AgentsConnection.findOneAndUpdate(
        { userId, 'connections.provider': provider },
        { $set: { defaultProvider: provider } },
        { new: true },
      );

      if (doc) {
        return normalizeConnections(doc);
      }

      // A document still in the single-`connection` shape has no array for
      // that filter to match. Write the normalized (sealed) array with the
      // default, as the other writes do; the shape check in the filter keeps
      // a concurrent write from being overwritten.
      const stored = await models.AgentsConnection.findOne({
        userId,
      }).lean<IAgentsConnectionsDocument>();

      if (!stored || Array.isArray(stored.connections)) {
        return null;
      }

      const entries = normalizeConnections(stored)?.connections ?? [];

      if (!entries.some((entry) => entry.provider === provider)) {
        return null;
      }

      entries.forEach(sealEntryConfig);

      return normalizeConnections(
        await models.AgentsConnection.findOneAndUpdate(
          { userId, connections: { $exists: false } },
          {
            $set: { connections: entries, defaultProvider: provider },
            $unset: { connection: '' },
          },
          { new: true },
        ),
      );
    }
  }

  agentsConnectionSchema.loadClass(AgentsConnection);

  return agentsConnectionSchema;
};
