import {
  collectPropertyDataFromColumns,
  mergePropertyData,
  propertyDataPath,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
} from 'erxes-api-shared/core-modules';
import {
  ImportHeaderDataType,
  ImportHeaderDefinition,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getCustomFields } from '~/modules/forms/utils';

const MAX_ROW_COLUMNS = 20;

// A fresh workspace has no repeating rows to measure, so the template would
// offer a single column and there would be no way to seed more by import.
const MIN_ROW_COLUMNS = 3;

const COLLECTION_BY_CONTENT_TYPE: Record<string, keyof IModels> = {
  'core:customer': 'Customers',
  'core:company': 'Companies',
  'core:product': 'Products',
  'core:user': 'Users',
};

const countRepeatingGroupRows = async (
  models: IModels,
  contentType: string,
  groupIds: string[],
): Promise<Map<string, number>> => {
  const counts = new Map(groupIds.map((groupId) => [groupId, MIN_ROW_COLUMNS]));
  const modelName = COLLECTION_BY_CONTENT_TYPE[contentType];

  if (!modelName || !groupIds.length) {
    return counts;
  }

  const collection = models[modelName] as unknown as Model<unknown>;

  for (const groupId of groupIds) {
    const path = propertyDataPath(toPropertyGroupKey(groupId));

    const [largest] = await collection
      .aggregate([
        { $match: { [path]: { $type: 'array' } } },
        { $project: { size: { $size: `$${path}` } } },
        { $sort: { size: -1 } },
        { $limit: 1 },
      ])
      .exec();

    counts.set(
      groupId,
      Math.min(
        Math.max(Number(largest?.size) || 0, MIN_ROW_COLUMNS),
        MAX_ROW_COLUMNS,
      ),
    );
  }

  return counts;
};

const FIELD_DATA_TYPES: Record<string, ImportHeaderDataType> = {
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  check: 'boolean',
  select: 'select',
  radio: 'select',
  multiSelect: 'multiSelect',
};

const FORMAT_EXAMPLES: Record<ImportHeaderDataType, string> = {
  text: '',
  number: '1234.5',
  date: 'YYYY-MM-DD',
  boolean: 'true / false',
  select: '',
  multiSelect: '',
};

/** Tell the importer what an acceptable cell looks like for this field. */
const describeFieldFormat = (field: {
  type?: string;
  options?: unknown[];
  isRequired?: boolean;
  validations?: Record<string, unknown>;
}): Pick<
  ImportHeaderDefinition,
  'dataType' | 'options' | 'example' | 'required'
> => {
  const dataType = FIELD_DATA_TYPES[field.type || ''] || 'text';

  const options = (field.options || [])
    .map((option) =>
      typeof option === 'string'
        ? option
        : String(
            (option as { value?: string; label?: string })?.value ??
              (option as { label?: string })?.label ??
              '',
          ),
    )
    .filter(Boolean);

  const example =
    options.length && (dataType === 'select' || dataType === 'multiSelect')
      ? options.slice(0, 3).join(dataType === 'multiSelect' ? ', ' : ' | ')
      : FORMAT_EXAMPLES[dataType];

  return {
    dataType,
    ...(options.length ? { options } : {}),
    ...(example ? { example } : {}),
    ...(field.isRequired || field.validations?.required
      ? { required: true }
      : {}),
  };
};

export const getCustomPropertyHeaders = async (
  models: IModels,
  contentType?: string,
): Promise<ImportHeaderDefinition[]> => {
  if (!contentType) {
    return [];
  }

  const customFields = await getCustomFields(models, contentType);
  const groupIds = customFields
    .map((field) => field.groupId)
    .filter(Boolean)
    .map(String);

  const groups = groupIds.length
    ? await models.FieldsGroups.find({ _id: { $in: groupIds } }).lean()
    : [];
  const groupById = new Map(groups.map((group) => [String(group._id), group]));

  const rowCounts = await countRepeatingGroupRows(
    models,
    contentType,
    groups
      .filter((group) => group.configs?.isMultiple)
      .map((group) => String(group._id)),
  );

  return customFields.flatMap((field) => {
    const group = field.groupId ? groupById.get(String(field.groupId)) : null;
    const fieldId = String(field._id);
    const groupId = group ? String(group._id) : '';

    // A repeating row carries its number inside the code, so two rows of the
    // same field never resolve to one column.
    const buildHeader = (
      label: string,
      key: string,
      rowIndex?: number,
    ): ImportHeaderDefinition => {
      const taggedCode = field.code
        ? rowIndex
          ? `${field.code}#${rowIndex}`
          : field.code
        : '';

      return {
        label: taggedCode ? `${label} [${taggedCode}]` : label,
        key,
        aliases: [
          label,
          taggedCode,
          key,
          // A bare field name or code has no row, so only the first row
          // answers to it.
          ...(rowIndex && rowIndex > 1
            ? []
            : [
                field.name,
                field.code,
                field.code ? `${field.name} [${field.code}]` : '',
              ]),
        ].filter(Boolean) as string[],
        type: 'customProperty',
        code: field.code || undefined,
        rowIndex,
        ...describeFieldFormat(field),
      };
    };

    if (group?.configs?.isMultiple) {
      const rows = rowCounts.get(groupId) || 1;

      return Array.from({ length: rows }, (_, offset) =>
        buildHeader(
          `${group.name} ${offset + 1} / ${field.name}`,
          toPropertyRowColumnKey(groupId, fieldId, offset + 1),
          offset + 1,
        ),
      );
    }

    return [
      buildHeader(
        group?.name ? `${group.name} / ${field.name}` : field.name,
        propertyDataPath(fieldId),
      ),
    ];
  });
};

export const extractPropertiesData = async (
  models: IModels,
  doc: Record<string, any>,
) => {
  const propertiesData = collectPropertyDataFromColumns(doc);

  if (Object.keys(propertiesData).length) {
    // A spreadsheet has no field types, so the import is the one write path
    // that must check values against the shape each field declares.
    doc.propertiesData = await models.Fields.validateFieldValues(
      {
        ...(doc.propertiesData || {}),
        ...propertiesData,
      },
      { strict: true },
    );
  }
};

/**
 * Shape an import row into a `$set` payload for a record that already exists.
 *
 * `createdAt` belongs to the original write, and `propertiesData` is merged
 * instead of replaced — an import row only carries the columns that file had,
 * so writing it wholesale would erase every property the file left out.
 */
export const buildImportUpdateDoc = (
  existingDoc: Record<string, any> | undefined,
  doc: Record<string, any>,
): Record<string, any> => {
  const updateDoc: Record<string, any> = { ...doc, updatedAt: new Date() };

  delete updateDoc.createdAt;

  if (updateDoc.propertiesData) {
    updateDoc.propertiesData = mergePropertyData(
      existingDoc?.propertiesData,
      updateDoc.propertiesData,
    );
  }

  return updateDoc;
};

/**
 * Read what a bulkWrite actually did with one operation.
 *
 * Mongoose reports per-write failures — a rejected enum, a failed cast, a
 * duplicate key — in `mongoose.results` rather than throwing, so a caller that
 * only looks at `insertedIds` counts rejected rows as successes and loses the
 * message explaining why the row was refused.
 */
export const readImportBulkOutcome = ({
  bulkResult,
  operationIndex,
  isInsert,
}: {
  bulkResult: any;
  operationIndex: number;
  isInsert: boolean;
}): { error?: string; insertedId?: unknown } => {
  const failure = bulkResult?.mongoose?.results?.[operationIndex];

  if (failure) {
    return { error: failure.message || String(failure) };
  }

  if (!isInsert) {
    return {};
  }

  const insertedIds = bulkResult?.insertedIds || {};
  const insertedId =
    insertedIds[operationIndex] ?? insertedIds[String(operationIndex)];

  return insertedId ? { insertedId } : { error: 'Insert was not acknowledged' };
};

/**
 * Resolve the tag names in a CSV cell into ids, creating what is missing.
 *
 * Tag names are unique across every content type, so the lookup must not be
 * narrowed by type — a name already held by another type has to be reused
 * instead of re-created. Names are also deduplicated and resolved one at a
 * time: the same name twice in one cell would otherwise race itself into a
 * duplicate-key error.
 */
export const resolveImportTagIds = async (
  models: IModels,
  type: string,
  tags: string = '',
): Promise<string[]> => {
  const tagNames = [
    ...new Set(
      String(tags ?? '')
        .split(',')
        .map((tagName) => tagName.trim())
        .filter(Boolean),
    ),
  ];

  const tagIds: string[] = [];

  for (const name of tagNames) {
    const existing = await models.Tags.findOne({ name }).lean();

    tagIds.push(
      String(
        existing?._id ?? (await models.Tags.createTag({ name, type }))._id,
      ),
    );
  }

  return tagIds;
};
