import {
  PluginExportPage,
  PluginExportRequest,
  PluginImportRequest,
  PluginImportResult,
  type TransferRecordType,
} from '@erxes/core-contract';
import { type Db, newId, pluginInstallations, plugins } from '@erxes/core-db';
import { TRANSFER_RECORD_TYPES } from '@erxes/core-db/enums';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { callerCan } from '~/http/access';
import { notAllowed, notFound } from '~/http/errors';
import { deliverToPlugin, installedWhere } from '~/modules/plugins/pluginDelivery';

const CORE_TRANSFER_TYP = 'erxes-core-transfer+jwt';

type Direction = 'import' | 'export';

export type CoreRecordType = (typeof TRANSFER_RECORD_TYPES)[number];

/** Customers, leads and companies: core reads and writes them itself. */
export const isCoreType = (recordType: TransferRecordType): recordType is CoreRecordType =>
  TRANSFER_RECORD_TYPES.some((type) => type === recordType);

const CORE_PERMISSIONS = { import: 'contacts.import', export: 'contacts.export' } as const;

const CORE_LABELS = { customer: 'Customers', lead: 'Leads', company: 'Companies' } as const;

/** The record types installed, active plugins (or `plugin`) declare in `transfer`, with their API. */
const pluginTransfers = async (client: Db, plugin?: string) => {
  const rows = await client
    .select({ plugin: plugins.name, manifest: plugins.manifest })
    .from(pluginInstallations)
    .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
    .where(installedWhere(plugin));

  return rows.flatMap(({ plugin: name, manifest }) => {
    const api = manifest?.api;

    return api
      ? (manifest.transfer ?? []).map((spec) => ({ ...spec, plugin: name, url: api.url }))
      : [];
  });
};

export type PluginTransfer = Awaited<ReturnType<typeof pluginTransfers>>[number];

/** A plugin record type's declaration, while its plugin is installed and active here. */
export const pluginTransfer = async (client: Db, recordType: TransferRecordType) => {
  const found = (await pluginTransfers(client, recordType.split(':')[0])).find(
    (spec) => spec.type === recordType,
  );

  if (!found) throw notFound('Record type');

  return found;
};

/**
 * Every record type here, with the permissions importing and exporting it need and whether the
 * member holds them: contacts' for core's, the manifest's for a plugin's.
 */
const allTypes = async (client: Db) =>
  [
    ...TRANSFER_RECORD_TYPES.map((recordType) => ({
      recordType,
      label: CORE_LABELS[recordType],
      plugin: null,
      permissions: CORE_PERMISSIONS,
    })),
    ...(await pluginTransfers(client)).map((spec) => ({
      recordType: spec.type,
      label: spec.label,
      plugin: spec.plugin,
      permissions: { import: spec.importPermission, export: spec.exportPermission },
    })),
  ].map((type) => ({
    ...type,
    canImport: callerCan(type.permissions.import),
    canExport: callerCan(type.permissions.export),
  }));

type Type = Awaited<ReturnType<typeof allTypes>>[number];

const allows = (type: Type, direction: Direction) =>
  direction === 'import' ? type.canImport : type.canExport;

const typeOf = async (client: Db, recordType: TransferRecordType) => {
  const type = (await allTypes(client)).find((item) => item.recordType === recordType);

  if (!type) throw notFound('Record type');

  return type;
};

/** The record types the member may import or export. */
export const transferTypes = async (client: Db) => ({
  data: (await allTypes(client)).filter((type) => type.canImport || type.canExport),
});

/** The record types the member may import (or export): what their list of imports (exports) shows. */
export const transferableTypes = async (client: Db, direction: Direction) => {
  const types = (await allTypes(client)).filter((type) => allows(type, direction));

  if (!types.length) throw notAllowed(CORE_PERMISSIONS[direction]);

  return types.map((type) => type.recordType);
};

/** The member may import (or export) the record type. */
export const assertCanTransfer = async (
  client: Db,
  recordType: TransferRecordType,
  direction: Direction,
) => {
  const type = await typeOf(client, recordType);

  if (!allows(type, direction)) throw notAllowed(type.permissions[direction]);
};

/** The member may import or export the record type, so may see its columns. */
export const assertSeesColumns = async (client: Db, recordType: TransferRecordType) => {
  const type = await typeOf(client, recordType);

  if (!type.canImport && !type.canExport) throw notAllowed(type.permissions.export);
};

/**
 * POSTs the request to `<api.url>/transfer/<kind>` with a core token (`erxes-core-transfer+jwt`,
 * the body's digest) and `Idempotency-Key: <requestId>`. Not 2xx, or no answer in time, throws.
 */
const ask = (
  spec: PluginTransfer,
  request: z.infer<typeof PluginExportRequest | typeof PluginImportRequest>,
) =>
  deliverToPlugin({
    plugin: spec.plugin,
    url: spec.url,
    path: `/transfer/${request.kind}`,
    orgId: request.orgId,
    kind: 'transfer',
    id: request.requestId,
    body: JSON.stringify(request),
    typ: CORE_TRANSFER_TYP,
    headers: { 'User-Agent': 'erxes-transfer/1' },
    timeoutMs: 60_000,
    // A page of rows, or what each row of a batch did: read whole.
    maxBytes: 16 * 1024 * 1024,
  });

type Input<T extends z.ZodType> = Omit<z.input<T>, 'kind' | 'requestId' | 'type'>;

/** One page of the plugin's records to export, as it answers: rows by column key and the next cursor. */
export const exportPage = async (spec: PluginTransfer, input: Input<typeof PluginExportRequest>) =>
  PluginExportPage.parse(
    JSON.parse(
      await ask(
        spec,
        PluginExportRequest.parse({
          ...input,
          kind: 'export',
          requestId: newId(),
          type: spec.type,
        }),
      ),
    ),
  );

/** What the plugin did (or, in a check, would do) with a batch of rows; `requestId` stays the same when it is retried. */
export const importBatch = async (
  spec: PluginTransfer,
  requestId: string,
  input: Input<typeof PluginImportRequest>,
) =>
  PluginImportResult.parse(
    JSON.parse(
      await ask(
        spec,
        PluginImportRequest.parse({ ...input, kind: 'import', requestId, type: spec.type }),
      ),
    ),
  );
