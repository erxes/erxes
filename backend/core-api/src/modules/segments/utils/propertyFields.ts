import {
  propertyDataPath,
  SegmentField,
  SegmentFieldMeta,
  SegmentFieldNamespace,
  toPropertyRowKey,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IFieldDocument } from '@/properties/@types/field';

const TEXT_TYPES = ['text', 'textarea', 'phone', 'list'];
const OPTION_TYPES = ['select', 'radio', 'check', 'multiSelect'];

const toSegmentField = (
  field: IFieldDocument,
  key: string,
  label: string,
): SegmentFieldMeta | null => {
  const base = { key, label };

  if (TEXT_TYPES.includes(field.type)) {
    return SegmentField.text(base);
  }

  if (OPTION_TYPES.includes(field.type)) {
    return SegmentField.static({
      ...base,
      options: (field.options || [])
        .filter((option) => !option.deprecated)
        .map(({ value, label }) => ({ value, label })),
    });
  }

  switch (field.type) {
    case 'number':
      return SegmentField.number(base);
    case 'date':
      return SegmentField.date(base);
    case 'boolean':
      return SegmentField.boolean(base);
    default:
      // editor, objectList, file and relation values are not comparable
      return null;
  }
};

export const listPropertySegmentFields = async (
  models: IModels,
  namespace: SegmentFieldNamespace,
): Promise<SegmentFieldMeta[]> => {
  const { propertyType, prefix } = namespace;

  if (!propertyType) {
    return [];
  }

  const [fields, repeatingGroups] = await Promise.all([
    models.Fields.find({
      contentType: propertyType,
      archivedAt: { $exists: false },
    })
      .sort({ order: 1 })
      .lean<IFieldDocument[]>(),
    models.FieldsGroups.find(
      { contentType: propertyType, 'configs.isMultiple': true },
      { name: 1 },
    ).lean<{ _id: string; name: string }[]>(),
  ]);

  const groupNameById = new Map(
    repeatingGroups.map((group) => [String(group._id), group.name]),
  );

  return fields.flatMap((field) => {
    const fieldId = String(field._id);
    const groupName = groupNameById.get(field.groupId);

    // a repeating group stores rows, so its fields read through the row key
    const entryKey =
      groupName === undefined
        ? fieldId
        : toPropertyRowKey(field.groupId, fieldId);

    const meta = toSegmentField(
      field,
      propertyDataPath(entryKey, prefix),
      groupName ? `${groupName} / ${field.name}` : field.name,
    );

    return meta ? [meta] : [];
  });
};
