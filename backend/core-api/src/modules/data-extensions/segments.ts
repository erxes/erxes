import {
  getActiveDataExtensionFields,
  SegmentFieldMeta,
  toDataExtensionSegmentFields,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/** The segment fields a record type's active Data Extensions offer. */
export const listDataExtensionSegmentFields = async (
  models: IModels,
  recordType: string,
): Promise<SegmentFieldMeta[]> => {
  const fields = await getActiveDataExtensionFields(models, [recordType]);

  return [...fields]
    .sort((a, b) => a.order - b.order)
    .flatMap((field) => toDataExtensionSegmentFields(field));
};
