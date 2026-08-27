import { FilterQuery, Schema } from 'mongoose';

export type SearchTokenMode = 'exact' | 'word' | 'prefix' | 'word-prefix';

export interface ISearchTokenFieldConfig {
  path: string;
  mode: SearchTokenMode;
  minLength?: number;
}

export interface ISearchTokenConfig {
  enabled: boolean;
  fields: ISearchTokenFieldConfig[];
  legacy?: {
    enabled: boolean;
    minLength?: number;
  };
  tokenField?: string;
  version?: number;
}

export interface ISchemaWrapperOptions {
  search?: ISearchTokenConfig;
}

const DEFAULT_MIN_LENGTH = 3;
const DEFAULT_TOKEN_FIELD = 'searchTokens';
const TOKEN_MODE_KEYS: Record<SearchTokenMode, string> = {
  exact: 'e',
  word: 'w',
  prefix: 'p',
  'word-prefix': 'wp',
};

const searchConfigurations = new WeakMap<Schema, ISearchTokenConfig>();

const normalizeValue = (value: string) =>
  value.normalize('NFKC').toLocaleLowerCase().trim().replace(/\s+/g, ' ');

export const splitSearchWords = (value: string): string[] =>
  normalizeValue(value).match(/[\p{L}\p{N}]+/gu) ?? [];

const normalizeExactValue = (value: string) => splitSearchWords(value).join('');

const getValuesAtPath = (source: unknown, path: string): string[] => {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (current === null || typeof current !== 'object') {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, source);

  const values = Array.isArray(value) ? value : [value];

  return values
    .filter(
      (item): item is string | number =>
        typeof item === 'string' || typeof item === 'number',
    )
    .map(String)
    .filter(Boolean);
};

const formatToken = (field: ISearchTokenFieldConfig, value: string): string =>
  `${field.path}:${TOKEN_MODE_KEYS[field.mode]}:${value}`;

const generateFieldTokens = (
  value: string,
  field: ISearchTokenFieldConfig,
): string[] => {
  const minLength = field.minLength ?? DEFAULT_MIN_LENGTH;

  if (field.mode === 'exact') {
    const exactValue = normalizeExactValue(value);
    return exactValue.length >= minLength
      ? [formatToken(field, exactValue)]
      : [];
  }

  const words =
    field.mode === 'prefix' ? [normalizeValue(value)] : splitSearchWords(value);

  if (field.mode === 'word') {
    return words
      .filter((word) => word.length >= minLength)
      .map((word) => formatToken(field, word));
  }

  return words.flatMap((word) => {
    const tokens: string[] = [];

    for (let length = minLength; length <= word.length; length += 1) {
      tokens.push(formatToken(field, word.slice(0, length)));
    }

    return tokens;
  });
};

export const generateConfiguredSearchTokens = (
  source: unknown,
  config: ISearchTokenConfig,
): string[] => {
  if (!config.enabled) {
    return [];
  }

  const tokens = config.fields.flatMap((field) =>
    getValuesAtPath(source, field.path).flatMap((value) =>
      generateFieldTokens(value, field),
    ),
  );

  return [...new Set(tokens)];
};

export const buildSearchTokenFilter = <T>(
  searchValue: string,
  config: ISearchTokenConfig,
): FilterQuery<T> => {
  const words = splitSearchWords(searchValue);

  if (!config.enabled || words.length === 0) {
    return { _id: { $in: [] } } as FilterQuery<T>;
  }

  const wordClauses = words.map((word) => {
    const candidates = config.fields.flatMap((field) => {
      if (field.mode === 'exact') {
        return [];
      }

      const minLength = field.minLength ?? DEFAULT_MIN_LENGTH;

      if (word.length < minLength) {
        return [];
      }

      return [formatToken(field, normalizeValue(word))];
    });

    return candidates.length > 0
      ? { [config.tokenField ?? DEFAULT_TOKEN_FIELD]: { $in: candidates } }
      : { _id: { $in: [] } };
  });

  const exactValue = normalizeExactValue(searchValue);
  const exactCandidates = config.fields.flatMap((field) => {
    const minLength = field.minLength ?? DEFAULT_MIN_LENGTH;

    return field.mode === 'exact' && exactValue.length >= minLength
      ? [formatToken(field, exactValue)]
      : [];
  });
  const alternatives: FilterQuery<T>[] = [];

  if (wordClauses.length > 0) {
    alternatives.push({ $and: wordClauses } as FilterQuery<T>);
  }

  if (exactCandidates.length > 0) {
    alternatives.push({
      [config.tokenField ?? DEFAULT_TOKEN_FIELD]: { $in: exactCandidates },
    } as FilterQuery<T>);
  }

  const legacyMinLength = config.legacy?.minLength ?? DEFAULT_MIN_LENGTH;

  if (
    config.legacy?.enabled &&
    words.every((word) => word.length >= legacyMinLength)
  ) {
    alternatives.push({
      [config.tokenField ?? DEFAULT_TOKEN_FIELD]: { $all: words },
    } as FilterQuery<T>);
  }

  return alternatives.length > 0
    ? ({ $or: alternatives } as FilterQuery<T>)
    : ({ _id: { $in: [] } } as FilterQuery<T>);
};

export const configureSchemaSearchTokens = (
  schema: Schema,
  config: ISearchTokenConfig,
) => {
  if (!config.enabled) {
    return;
  }

  const tokenField = config.tokenField ?? DEFAULT_TOKEN_FIELD;

  schema.add({
    [tokenField]: { type: [String], default: [] },
    searchTokenVersion: { type: Number, default: config.version ?? 1 },
  });
  searchConfigurations.set(schema, config);

  schema.pre('save', function () {
    this.set(
      tokenField,
      generateConfiguredSearchTokens(this.toObject(), config),
    );
    this.set('searchTokenVersion', config.version ?? 1);
  });
};

export const getSchemaSearchTokenConfig = (
  schema: Schema,
): ISearchTokenConfig | undefined => searchConfigurations.get(schema);
