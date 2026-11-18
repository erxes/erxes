import {
  IDataExtensionRecordType,
  sendAutomationTrigger,
  sendSegmentChanged,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { segmentSource } from '~/meta/segments/collections';

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
  const source = segmentSource(models, contentType);
  const [target] = source
    ? await source.collection
        .find({ ...source.baseQuery, _id: recordId })
        .lean()
    : [await loadRecord()];

  if (!target) {
    return;
  }

  sendAutomationTrigger(subdomain, {
    type: contentType,
    targets: [target],
    recordType: 'existing',
  });
};
