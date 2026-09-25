import type { ErxesCustomFieldType, WordPressItem } from './types';

const ACF_FIELD_KEY_PATTERN = /^field_[a-zA-Z0-9_-]+$/;

type SerializedKey = number | string;
type SerializedScalar = boolean | null | number | string;
type SerializedValue = Map<SerializedKey, SerializedValue> | SerializedScalar;

interface SerializedResult {
  nextIndex: number;
  value: SerializedValue;
}

export interface WordPressAcfFieldDefinition {
  description: string;
  fieldKey: string;
  isRequired: boolean;
  label: string;
  name: string;
  options: string[];
  type: ErxesCustomFieldType;
}

const parseSerializedString = (
  source: string,
  startIndex: number,
): SerializedResult | undefined => {
  const lengthEnd = source.indexOf(':', startIndex + 2);

  if (lengthEnd === -1 || source[lengthEnd + 1] !== '"') {
    return undefined;
  }

  const byteLength = Number.parseInt(
    source.slice(startIndex + 2, lengthEnd),
    10,
  );

  if (!Number.isSafeInteger(byteLength) || byteLength < 0) {
    return undefined;
  }

  const valueStart = lengthEnd + 2;
  let valueEnd = valueStart;
  let consumedBytes = 0;

  while (valueEnd < source.length && consumedBytes < byteLength) {
    const codePoint = source.codePointAt(valueEnd);

    if (codePoint === undefined) {
      return undefined;
    }

    const character = String.fromCodePoint(codePoint);
    consumedBytes += Buffer.byteLength(character);
    valueEnd += character.length;
  }

  if (
    consumedBytes !== byteLength ||
    source.slice(valueEnd, valueEnd + 2) !== '";'
  ) {
    return undefined;
  }

  return {
    value: source.slice(valueStart, valueEnd),
    nextIndex: valueEnd + 2,
  };
};

const parseSerializedNumber = (
  source: string,
  startIndex: number,
): SerializedResult | undefined => {
  const valueEnd = source.indexOf(';', startIndex + 2);

  if (valueEnd === -1) {
    return undefined;
  }

  const value = Number(source.slice(startIndex + 2, valueEnd));

  if (!Number.isFinite(value)) {
    return undefined;
  }

  return { value, nextIndex: valueEnd + 1 };
};

const parseSerializedValue = (
  source: string,
  startIndex: number,
): SerializedResult | undefined => {
  const kind = source[startIndex];

  if (kind === 's' && source[startIndex + 1] === ':') {
    return parseSerializedString(source, startIndex);
  }

  if ((kind === 'i' || kind === 'd') && source[startIndex + 1] === ':') {
    return parseSerializedNumber(source, startIndex);
  }

  if (kind === 'b' && source[startIndex + 1] === ':') {
    const booleanValue = source[startIndex + 2];

    if (
      (booleanValue !== '0' && booleanValue !== '1') ||
      source[startIndex + 3] !== ';'
    ) {
      return undefined;
    }

    return {
      value: booleanValue === '1',
      nextIndex: startIndex + 4,
    };
  }

  if (kind === 'N' && source[startIndex + 1] === ';') {
    return { value: null, nextIndex: startIndex + 2 };
  }

  if (kind !== 'a' || source[startIndex + 1] !== ':') {
    return undefined;
  }

  const countEnd = source.indexOf(':', startIndex + 2);

  if (countEnd === -1 || source[countEnd + 1] !== '{') {
    return undefined;
  }

  const entryCount = Number.parseInt(
    source.slice(startIndex + 2, countEnd),
    10,
  );

  if (!Number.isSafeInteger(entryCount) || entryCount < 0) {
    return undefined;
  }

  const entries = new Map<SerializedKey, SerializedValue>();
  let nextIndex = countEnd + 2;

  for (let index = 0; index < entryCount; index += 1) {
    const keyResult = parseSerializedValue(source, nextIndex);

    if (
      !keyResult ||
      (typeof keyResult.value !== 'string' &&
        typeof keyResult.value !== 'number')
    ) {
      return undefined;
    }

    const valueResult = parseSerializedValue(source, keyResult.nextIndex);

    if (!valueResult) {
      return undefined;
    }

    entries.set(keyResult.value, valueResult.value);
    nextIndex = valueResult.nextIndex;
  }

  if (source[nextIndex] !== '}') {
    return undefined;
  }

  return { value: entries, nextIndex: nextIndex + 1 };
};

const readSerializedProperty = (
  content: string,
  property: string,
): SerializedValue | undefined => {
  const serializedProperty = `s:${Buffer.byteLength(property)}:"${property}";`;
  const propertyIndex = content.indexOf(serializedProperty);

  if (propertyIndex === -1) {
    return undefined;
  }

  return parseSerializedValue(
    content,
    propertyIndex + serializedProperty.length,
  )?.value;
};

const asBoolean = (value: SerializedValue | undefined): boolean =>
  value === true || value === 1 || value === '1';

const serializedOptions = (value: SerializedValue | undefined): string[] => {
  if (!(value instanceof Map)) {
    return [];
  }

  return [...new Set([...value.keys()].map(String))];
};

const mapAcfFieldType = (
  acfType: string,
  multiple: boolean,
  options: string[],
): ErxesCustomFieldType => {
  switch (acfType) {
    case 'textarea':
      return 'textarea';
    case 'number':
    case 'range':
      return 'number';
    case 'email':
      return 'email';
    case 'url':
      return 'url';
    case 'select':
      return multiple ? 'text' : 'select';
    case 'button_group':
    case 'radio':
      return 'radio';
    case 'wysiwyg':
      return 'richText';
    default:
      return 'text';
  }
};

export const resolveWordPressAcfFieldKey = (
  item: WordPressItem,
  metaKey: string,
): string | undefined =>
  item.meta[`_${metaKey}`]?.find((value) => ACF_FIELD_KEY_PATTERN.test(value));

export const buildWordPressAcfFieldDefinitions = (
  items: WordPressItem[],
): Map<string, WordPressAcfFieldDefinition> => {
  const definitions = new Map<string, WordPressAcfFieldDefinition>();

  for (const item of items) {
    if (
      item.postType !== 'acf-field' ||
      !ACF_FIELD_KEY_PATTERN.test(item.slug)
    ) {
      continue;
    }

    const acfTypeValue = readSerializedProperty(item.content, 'type');
    const acfType = typeof acfTypeValue === 'string' ? acfTypeValue : 'text';
    const options = serializedOptions(
      readSerializedProperty(item.content, 'choices'),
    );
    const multiple = asBoolean(
      readSerializedProperty(item.content, 'multiple'),
    );
    const instructionsValue = readSerializedProperty(
      item.content,
      'instructions',
    );
    const instructions =
      typeof instructionsValue === 'string' ? instructionsValue.trim() : '';

    definitions.set(item.slug, {
      fieldKey: item.slug,
      label: item.title.trim() || item.excerpt.trim() || item.slug,
      name: item.excerpt.trim(),
      type: mapAcfFieldType(acfType, multiple, options),
      description:
        instructions ||
        `Imported from WordPress ACF field "${item.slug}" (${acfType}).`,
      isRequired: asBoolean(readSerializedProperty(item.content, 'required')),
      options,
    });
  }

  return definitions;
};
