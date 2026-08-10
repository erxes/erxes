import { ISearchProvider, TSearchSelection } from 'erxes-ui';
import { DocumentNode, parse, visit } from 'graphql';
import {
  GLOBAL_SEARCH_ALLOWED_VARIABLES,
  GLOBAL_SEARCH_OPERATION_NAME,
  GLOBAL_SEARCH_VARIABLE_DEFS,
} from '@/search/constants/globalSearch';

const ALIAS_PATTERN = /^gs_[a-z0-9]+_[a-z0-9_]+$/;

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
      `query ${GLOBAL_SEARCH_OPERATION_NAME}Probe(${GLOBAL_SEARCH_VARIABLE_DEFS}) { ${provider.selections
        .map(printSelection)
        .join('\n')} }`,
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
          `[GlobalSearch] rejected provider "${provider?.key ?? 'unknown'}": ${shapeError}`,
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

export const buildGlobalSearchDocument = (
  providers: ISearchProvider[],
): DocumentNode => {
  const cacheKey = providers
    .flatMap((provider) => provider.selections.map((s) => s.alias))
    .sort((a, b) => a.localeCompare(b))
    .join('|');

  const cached = documentCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const selectionsSource = providers
    .flatMap((provider) => provider.selections)
    .map(printSelection)
    .join('\n');

  const document = parse(
    `query ${GLOBAL_SEARCH_OPERATION_NAME}(${GLOBAL_SEARCH_VARIABLE_DEFS}) { ${selectionsSource} }`,
  );

  documentCache.set(cacheKey, document);

  return document;
};
