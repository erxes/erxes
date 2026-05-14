type PropertyOption = {
  label?: string;
  value?: string;
};

const EMPTY_VALUE_LABEL = 'Empty';

export const getBaseFieldType = (fieldType?: string) => {
  if (!fieldType) {
    return 'text';
  }

  return fieldType.startsWith('relation:') ? 'relation' : fieldType;
};

export const getFieldTypeLabel = (fieldType?: string) => {
  const baseFieldType = getBaseFieldType(fieldType);

  switch (baseFieldType) {
    case 'textarea':
      return 'Textarea';
    case 'number':
      return 'Number';
    case 'boolean':
      return 'True/False';
    case 'date':
      return 'Date';
    case 'select':
      return 'Select';
    case 'multiSelect':
      return 'Multiple Select';
    case 'check':
      return 'Checkbox';
    case 'radio':
      return 'Radio Button';
    case 'relation':
      return 'Relation';
    case 'file':
      return 'File';
    default:
      return 'Text';
  }
};

export const getOptionLabel = (value: string, options: PropertyOption[]) => {
  return options.find((option) => option.value === value)?.label || value;
};

export const getDisplayText = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE_LABEL;
  }

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime()) && value.includes('T')) {
      return parsedDate.toLocaleString();
    }

    return value;
  }

  if (Array.isArray(value)) {
    const values = value
      .map((item) => getDisplayText(item))
      .filter((item) => item !== EMPTY_VALUE_LABEL);

    return values.length ? values.join(', ') : EMPTY_VALUE_LABEL;
  }

  if (typeof value === 'object') {
    const maybeNamedValue = value as {
      name?: string;
      label?: string;
      text?: string;
      url?: string;
      _id?: string;
    };

    return (
      maybeNamedValue.name ||
      maybeNamedValue.label ||
      maybeNamedValue.text ||
      maybeNamedValue.url ||
      maybeNamedValue._id ||
      JSON.stringify(value)
    );
  }

  return String(value);
};

export const getNestedActivityValue = (
  container: unknown,
  candidates: Array<string | undefined>,
): unknown => {
  if (container === null || container === undefined) {
    return undefined;
  }

  if (typeof container !== 'object' || Array.isArray(container)) {
    return container;
  }

  const record = container as Record<string, unknown>;

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    if (candidate in record) {
      return record[candidate];
    }
  }

  const values = Object.values(record).filter(
    (value) => value !== undefined && value !== null && value !== '',
  );

  if (values.length === 1) {
    return values[0];
  }

  return undefined;
};

export const normalizePropertyValue = (
  value: unknown,
  fieldType?: string,
  options: PropertyOption[] = [],
) => {
  const baseFieldType = getBaseFieldType(fieldType);

  if (value === null || value === undefined || value === '') {
    return {
      kind: 'empty' as const,
      items: [EMPTY_VALUE_LABEL],
      isLongText: false,
    };
  }

  if (baseFieldType === 'select' || baseFieldType === 'radio') {
    return {
      kind: 'badge-list' as const,
      items: [getOptionLabel(String(value), options)],
      isLongText: false,
    };
  }

  if (baseFieldType === 'multiSelect' || baseFieldType === 'check') {
    const values = Array.isArray(value) ? value.map(String) : [String(value)];

    return {
      kind: 'badge-list' as const,
      items: values.map((item) => getOptionLabel(item, options)),
      isLongText: false,
    };
  }

  if (baseFieldType === 'boolean') {
    return {
      kind: 'badge-list' as const,
      items: [getDisplayText(value)],
      isLongText: false,
    };
  }

  if (baseFieldType === 'relation' || baseFieldType === 'file') {
    const values = Array.isArray(value) ? value : [value];

    return {
      kind: 'badge-list' as const,
      items: values.map((item) => getDisplayText(item)),
      isLongText: false,
    };
  }

  const text = getDisplayText(value);
  const isLongText =
    baseFieldType === 'textarea' || text.length > 72 || text.includes('\n');

  return {
    kind: isLongText ? ('long-text' as const) : ('text' as const),
    items: [text],
    isLongText,
  };
};

export const formatPropertyFieldValue = ({
  value,
  fieldType,
  options = [],
}: {
  value: unknown;
  fieldType?: string;
  options: Array<{ label?: string; value?: string }>;
}) => {
  if (value === null || value === undefined || value === '') {
    return 'empty';
  }

  const baseType = fieldType?.startsWith('relation:') ? 'relation' : fieldType;

  if (baseType === 'select' || baseType === 'radio') {
    return getOptionLabel(String(value), options);
  }

  if (baseType === 'multiSelect' || baseType === 'check') {
    const values = Array.isArray(value) ? value : [value];
    return values
      .map((item) => getOptionLabel(String(item), options))
      .join(', ');
  }

  if (baseType === 'date') {
    const parsedDate = value instanceof Date ? value : new Date(String(value));

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString();
    }
  }

  return getDisplayText(value);
};

export type PropertyFieldOption = PropertyOption;
