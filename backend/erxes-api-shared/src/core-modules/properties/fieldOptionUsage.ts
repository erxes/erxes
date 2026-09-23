import { PipelineStage } from 'mongoose';
import { propertyDataPath } from './keys';

export interface IFieldOptionUsageCount {
  value: string;
  count: number;
}

interface IValueDocPair {
  _id: { value: string; doc: unknown };
}

export interface IFieldOptionUsageModel {
  aggregate: (pipeline: PipelineStage[]) => Promise<IValueDocPair[]>;
}

// Groups by (value, document) so a record with several matches for the same
// value — a multiSelect array, several repeating-group rows — contributes one
// hit, not one per occurrence.
const GROUP_BY_VALUE_AND_DOC: PipelineStage.Group = {
  $group: { _id: { value: '$value', doc: '$_id' } },
};

// A field inside a repeating group is never stored under `propertiesData.<fieldId>`
// directly — its rows live under `propertiesData.<groupKey>[]`, one row per entry.
const buildGroupRowPipeline = (
  groupKey: string,
  fieldId: string,
  values: string[],
): PipelineStage[] => {
  const rowsPath = propertyDataPath(groupKey);
  const rowValuePath = `${rowsPath}.${fieldId}`;

  return [
    { $match: { [rowValuePath]: { $in: values } } },
    { $unwind: `$${rowsPath}` },
    { $match: { [rowValuePath]: { $in: values } } },
    {
      $project: {
        value: {
          $cond: [
            { $isArray: `$${rowValuePath}` },
            `$${rowValuePath}`,
            [`$${rowValuePath}`],
          ],
        },
      },
    },
    { $unwind: '$value' },
    { $match: { value: { $in: values } } },
    GROUP_BY_VALUE_AND_DOC,
  ];
};

export const getFieldOptionUsedValuesFromModel = async (
  model: IFieldOptionUsageModel,
  fieldId: string,
  values: string[],
  // Set when the field belongs to an `isMultiple` (repeating) group, so its
  // values must also be searched inside that group's rows.
  groupKey?: string | null,
): Promise<IFieldOptionUsageCount[]> => {
  if (!values.length) {
    return [];
  }

  const propertiesDataPath = `propertiesData.${fieldId}`;

  const pipelines = [
    // `syncFieldValues` keeps `customFieldsData` and `propertiesData` mirrored
    // for every record, so a hit can legitimately surface from both paths for
    // the very same document — the cross-pipeline dedupe below collapses that.
    model.aggregate([
      { $match: { 'customFieldsData.field': fieldId } },
      { $unwind: '$customFieldsData' },
      { $match: { 'customFieldsData.field': fieldId } },
      {
        $project: {
          value: {
            $cond: [
              { $isArray: '$customFieldsData.value' },
              '$customFieldsData.value',
              ['$customFieldsData.value'],
            ],
          },
        },
      },
      { $unwind: '$value' },
      { $match: { value: { $in: values } } },
      GROUP_BY_VALUE_AND_DOC,
    ]),
    model.aggregate([
      { $match: { [propertiesDataPath]: { $in: values } } },
      {
        $project: {
          value: {
            $cond: [
              { $isArray: `$${propertiesDataPath}` },
              `$${propertiesDataPath}`,
              [`$${propertiesDataPath}`],
            ],
          },
        },
      },
      { $unwind: '$value' },
      { $match: { value: { $in: values } } },
      GROUP_BY_VALUE_AND_DOC,
    ]),
  ];

  if (groupKey) {
    pipelines.push(
      model.aggregate(buildGroupRowPipeline(groupKey, fieldId, values)),
    );
  }

  const results = await Promise.all(pipelines);

  // A document can surface from more than one pipeline (customFieldsData and
  // propertiesData mirror each other); dedupe by (value, document) so it is
  // still counted once.
  const seenPairs = new Set<string>();
  const counts = new Map<string, number>();

  for (const { _id } of results.flat()) {
    const pairKey = `${_id.value}\u0000${String(_id.doc)}`;

    if (seenPairs.has(pairKey)) {
      continue;
    }

    seenPairs.add(pairKey);
    counts.set(_id.value, (counts.get(_id.value) || 0) + 1);
  }

  return Array.from(counts, ([value, count]) => ({ value, count }));
};
