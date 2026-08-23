import { ISearchProvider, TSearchSelection } from 'erxes-ui';
import { DocumentNode, parse, visit } from 'graphql';
import {
  GLOBAL_SEARCH_ALLOWED_VARIABLES,
  GLOBAL_SEARCH_OPERATION_NAME,
  GLOBAL_SEARCH_PAGE_OPERATION_NAME,
} from '@/search/constants/globalSearch';

const ALIAS_PATTERN = /^gs_[a-z0-9]+_[a-z0-9_]+$/;
const VARIABLE_PATTERN = /\$([A-Za-z_]\w*)/g;

const VARIABLE_TYPE_DEFS: Record<string, string> = {
  searchValue: 'String!',
  limit: 'Int!',
  cursor: 'String',
  orderBy: 'JSON!',
  sortDirection: 'Int!',
  sortField: 'String!',
};

const collectUsedVariables = (selections: TSearchSelection[]): string[] => {
  const used = new Set<string>();

  for (const selection of selections) {
    const source = `${selection.args ?? ''} ${selection.body ?? ''}`;

    for (const match of source.matchAll(VARIABLE_PATTERN)) {
      if (GLOBAL_SEARCH_ALLOWED_VARIABLES.has(match[1])) {
        used.add(match[1]);
      }
    }
  }

  return [...used].sort((a, b) => a.localeCompare(b));
};

const buildVariableDefs = (selections: TSearchSelection[]): string =>
  collectUsedVariables(selections)
    .map((name) => `$${name}: ${VARIABLE_TYPE_DEFS[name]}`)
    .join(', ');

const applySearchOverride = (
  args: string | undefined,
  override: string | undefined,
): string | undefined => {
  if (!args || override === undefined) {
    return args;
  }

  return args.replace(/\$searchValue/g, JSON.stringify(override));
};

const printSelection = (selection: TSearchSelection): string => {
  const args = selection.args ? `(${selection.args})` : '';
  const body = selection.body ? ` ${selection.body}` : '';

  return `${selection.alias}: ${selection.field}${args}${body}`;
};

const isValidShape = (provider: ISearchProvider): string | null => {
  if (!provider || typeof provider !== 'object') {
    return 'provider is not an object';
  }

  if (typeof provider.key !== 'string' || provider.key.length === 0) {
    return 'missing key';
  }

  if (typeof provider.label !== 'string' || provider.label.length === 0) {
    return 'missing label';
  }

  if (!Array.isArray(provider.selections) || provider.selections.length === 0) {
    return 'missing selections';
  }

  for (const selection of provider.selections) {
    if (
      !selection ||
      typeof selection !== 'object' ||
      typeof selection.alias !== 'string' ||
      typeof selection.field !== 'string' ||
      (selection.args !== undefined && typeof selection.args !== 'string') ||
      (selection.body !== undefined && typeof selection.body !== 'string')
    ) {
      return 'invalid selection';
    }
  }

  if (typeof provider.resolve !== 'function') {
    return 'missing resolve';
  }

  return null;
};

const isValidSyntax = (
  provider: ISearchProvider,
  seenAliases: Set<string>,
): string | null => {
  for (const selection of provider.selections) {
    if (!ALIAS_PATTERN.test(selection.alias)) {
      return `alias "${selection.alias}" must match ${ALIAS_PATTERN}`;
    }

    if (seenAliases.has(selection.alias)) {
      return `duplicate alias "${selection.alias}"`;
    }
  }

  let ast: DocumentNode;

  try {
    ast = parse(
      `query ${GLOBAL_SEARCH_OPERATION_NAME}Probe(${buildVariableDefs(
        provider.selections,
      )}) { ${provider.selections.map(printSelection).join('\n')} }`,
    );
  } catch (parseError) {
    return `invalid selection syntax: ${(parseError as Error).message}`;
  }

  let disallowedVariable: string | null = null;

  visit(ast, {
    Variable(node) {
      if (!GLOBAL_SEARCH_ALLOWED_VARIABLES.has(node.name.value)) {
        disallowedVariable = node.name.value;
      }
    },
  });

  if (disallowedVariable) {
    return `references disallowed variable "$${disallowedVariable}"`;
  }

  for (const selection of provider.selections) {
    seenAliases.add(selection.alias);
  }

  return null;
};

const rejectedProviderKeys = new Set<string>();

export const validateSearchProviders = (
  providers: ISearchProvider[],
): ISearchProvider[] => {
  const seenAliases = new Set<string>();
  const valid: ISearchProvider[] = [];

  for (const provider of providers) {
    const shapeError = isValidShape(provider);

    if (shapeError) {
      if (!rejectedProviderKeys.has(provider?.key ?? 'unknown')) {
        rejectedProviderKeys.add(provider?.key ?? 'unknown');
        console.error(
          `[GlobalSearch] rejected provider "${
            provider?.key ?? 'unknown'
          }": ${shapeError}`,
        );
      }

      continue;
    }

    const syntaxError = isValidSyntax(provider, seenAliases);

    if (syntaxError) {
      if (!rejectedProviderKeys.has(provider.key)) {
        rejectedProviderKeys.add(provider.key);
        console.error(
          `[GlobalSearch] rejected provider "${provider.key}": ${syntaxError}`,
        );
      }

      continue;
    }

    valid.push(provider);
  }

  return valid;
};

export const getRejectedProviderKeys = (): ReadonlySet<string> =>
  rejectedProviderKeys;

const documentCache = new Map<string, DocumentNode>();

const applyOverridesToSelections = (
  providers: ISearchProvider[],
  overrides: Record<string, string>,
): TSearchSelection[] =>
  providers.flatMap((provider) =>
    provider.selections.map((selection) => {
      const override = overrides[provider.key];

      return override === undefined
        ? selection
        : { ...selection, args: applySearchOverride(selection.args, override) };
    }),
  );

const buildSearchDocument = (
  providers: ISearchProvider[],
  operationName: string,
  overrides: Record<string, string> = {},
): DocumentNode => {
  const overrideKey =
    Object.keys(overrides).length === 0
      ? ''
      : `:${Object.entries(overrides)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join(',')}`;

  const cacheKey = `${operationName}:${providers
    .flatMap((provider) => provider.selections.map((s) => s.alias))
    .sort((a, b) => a.localeCompare(b))
    .join('|')}${overrideKey}`;

  const cached = documentCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const selections = applyOverridesToSelections(providers, overrides);
  const selectionsSource = selections.map(printSelection).join('\n');

  const document = parse(
    `query ${operationName}(${buildVariableDefs(
      selections,
    )}) { ${selectionsSource} }`,
  );

  documentCache.set(cacheKey, document);

  return document;
};

export const buildGlobalSearchDocument = (
  providers: ISearchProvider[],
  overrides: Record<string, string> = {},
): DocumentNode =>
  buildSearchDocument(providers, GLOBAL_SEARCH_OPERATION_NAME, overrides);

export const buildGlobalSearchPageDocument = (
  provider: ISearchProvider,
  override?: string,
): DocumentNode =>
  buildSearchDocument(
    [provider],
    GLOBAL_SEARCH_PAGE_OPERATION_NAME,
    override === undefined ? {} : { [provider.key]: override },
  );
