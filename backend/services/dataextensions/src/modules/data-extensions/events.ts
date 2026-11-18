import {
  IDataExtensionRecordType,
  sendAutomationTrigger,
  sendSegmentChanged,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/**
 * Where core keeps each record type it triggers automations for, as core's
 * segment sources define them. Core's records go out whole, as core's own
 * updates send them, so they are read from the tenant database both share.
 */
const CORE_SOURCES: Record<
  string,
  { collection: string; baseQuery: Record<string, unknown> }
> = {
  'core:contacts.customers': {
    collection: 'customers',
    baseQuery: { state: { $ne: 'lead' } },
  },
  'core:contacts.leads': {
    collection: 'customers',
    baseQuery: { state: 'lead' },
  },
  'core:contacts.companies': { collection: 'companies', baseQuery: {} },
  'core:organization.users': { collection: 'users', baseQuery: {} },
  'core:products.products': {
    collection: 'products',
    baseQuery: { status: { $ne: 'deleted' } },
  },
};

/**
 * Announces a change to a record's Data Extension values the way the owner's
 * own writes are announced: segments re-check the record, and automations
 * triggered by its type run. Writes made by an automation skip the trigger,
 * so a flow that sets a value cannot start itself again.
 */
export const announceDataExtensionChange = async (
  models: IModels,
  {
    subdomain,
    descriptor,
    recordId,
    fromAutomation,
    loadRecord,
  }: {
    subdomain: string;
    descriptor: IDataExtensionRecordType;
    recordId: string;
    fromAutomation?: boolean;
    /** The record as Data Extensions reads it, for owners outside core. */
    loadRecord: () => Promise<Record<string, unknown> | null | undefined>;
  },
) => {
  const contentType = descriptor.eventContentType;

  if (!contentType) {
    return;
  }

  sendSegmentChanged({
    subdomain,
    contentType: descriptor.segmentEventContentType || contentType,
    docIds: [recordId],
  });

  if (fromAutomation) {
    return;
  }

  // Core records go out whole, as their own updates send them; other
  // owners' records carry the native fields Data Extensions knows.
  const source = CORE_SOURCES[contentType];
  const target = source
    ? await models.DataExtensionFields.db
        .collection(source.collection)
        .findOne({ ...source.baseQuery, _id: recordId as never })
    : await loadRecord();

  if (!target) {
    return;
  }

  sendAutomationTrigger(subdomain, {
    type: contentType,
    targets: [target],
    recordType: 'existing',
  });
};
