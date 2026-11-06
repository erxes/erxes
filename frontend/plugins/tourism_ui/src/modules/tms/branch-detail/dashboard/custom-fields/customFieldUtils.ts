import type {
  ITourCustomField,
  ITourCustomFieldGroup,
  ITourCustomPostType,
} from '../tours/hooks/useTourCustomFields';

export interface ITourTypeFormValues {
  label: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface IFieldGroupFormValues {
  label: string;
  code?: string;
  customTourTypeIds: string[];
}

export interface IFieldFormValues {
  label: string;
  code?: string;
  type: string;
  description?: string;
  isRequired?: boolean;
  options?: string;
}

export const FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'date',
  'checkbox',
  'select',
  'multiSelect',
  'radio',
  'image',
  'file',
];

export const SYSTEM_TOUR_TYPE: ITourCustomPostType = {
  _id: 'tour',
  code: 'tour',
  name: 'tour',
  label: 'Tour',
  pluralLabel: 'Tours',
  isActive: true,
};

export const generateCode = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');

const parseOptions = (value?: string) =>
  value
    ? value
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)
    : [];

export const buildTourTypeFormValues = (
  type?: ITourCustomPostType,
): ITourTypeFormValues => ({
  label: type?.label || '',
  pluralLabel: type?.pluralLabel || '',
  code: type?.code || '',
  description: type?.description || '',
  isActive: type?.isActive ?? true,
});

export const buildFieldGroupFormValues = (
  group?: ITourCustomFieldGroup,
): IFieldGroupFormValues => ({
  label: group?.label || '',
  code: group?.code || '',
  customTourTypeIds: group?.customTourTypeIds || [],
});

export const buildFieldFormValues = (
  field?: ITourCustomField,
): IFieldFormValues => ({
  label: field?.label || '',
  code: field?.code || '',
  type: field?.type || 'text',
  description: field?.description || '',
  isRequired: field?.isRequired || false,
  options: (field?.options || []).join(', '),
});

export const toTourTypeInput = (
  values: ITourTypeFormValues,
  branchId: string,
) => ({
  branchId,
  label: values.label,
  pluralLabel: values.pluralLabel,
  code: values.code,
  description: values.description,
  isActive: values.isActive,
});

export const toFieldGroupInput = (
  branchId: string,
  values: IFieldGroupFormValues,
  group?: ITourCustomFieldGroup,
) => ({
  branchId,
  label: values.label,
  code: values.code,
  parentId: group?.parentId,
  order: group?.order,
  customTourTypeIds: values.customTourTypeIds || [],
  enabledTourIds: group?.enabledTourIds || [],
  fields: group?.fields || [],
});

export const toGroupFieldsInput = (
  group: ITourCustomFieldGroup,
  fields: ITourCustomField[],
  branchId: string,
) => ({
  ...toFieldGroupInput(
    group.branchId || branchId,
    buildFieldGroupFormValues(group),
    group,
  ),
  fields,
});

export const toTourCustomField = (
  values: IFieldFormValues,
  field?: ITourCustomField,
): ITourCustomField => ({
  ...(field?._id ? { _id: field._id } : {}),
  label: values.label,
  code: values.code || generateCode(values.label),
  type: values.type,
  description: values.description,
  isRequired: values.isRequired,
  options: parseOptions(values.options),
});

export const getTourCustomFieldKey = (field: ITourCustomField) =>
  field._id || field.code || '';

const FIELD_ID_SEPARATOR = '~';

export const getTourCustomFieldPanelId = (groupId: string, fieldKey: string) =>
  `${groupId}${FIELD_ID_SEPARATOR}${fieldKey}`;

export const parseTourCustomFieldPanelId = (contentId: string) => {
  const [groupId = '', fieldKey = ''] = contentId.split(FIELD_ID_SEPARATOR);

  return { groupId, fieldKey };
};
