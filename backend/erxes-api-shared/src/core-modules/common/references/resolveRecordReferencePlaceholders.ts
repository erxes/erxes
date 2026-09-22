import { resolveRecordReferenceValue } from './resolveRecordReferenceValue';
import {
  getLocalRecordReferenceType,
  getRecordReferencePluginName,
} from './utils';

type TResolveRecordReferencePlaceholdersProps = {
  subdomain: string;
  targetType: string;
  targetId?: string;
  target?: unknown;
  value: unknown;
  fallback?: unknown;
  alias?: string;
};

const PLACEHOLDER_REGEX = /\{\{\s*([^}]+)\s*\}\}/g;

const stringifyPlaceholderValue = (value: unknown, fallback?: unknown) => {
  if (value === undefined || value === null) {
    return fallback === undefined || fallback === null ? '' : String(fallback);
  }

  return String(value);
};

const resolvePlaceholderToken = async ({
  alias,
  fallback,
  subdomain,
  target,
  targetId,
  targetType,
  token,
}: Omit<TResolveRecordReferencePlaceholdersProps, 'value'> & {
  token: string;
}) => {
  const [head, ...pathParts] = token.trim().split('.');

  if (head !== alias || !pathParts.length) {
    return fallback;
  }

  return resolveRecordReferenceValue({
    subdomain,
    type: targetType,
    targetId,
    target,
    path: pathParts.join('.'),
    defaultValue: fallback,
  });
};

const resolveStringPlaceholders = async ({
  alias,
  fallback,
  subdomain,
  target,
  targetId,
  targetType,
  value,
}: TResolveRecordReferencePlaceholdersProps & {
  alias: string;
  value: string;
}) => {
  const matches = [...value.matchAll(PLACEHOLDER_REGEX)];

  if (!matches.length) {
    return value;
  }

  const isWholeValue =
    matches.length === 1 && matches[0][0].trim() === value.trim();

  if (isWholeValue) {
    return resolvePlaceholderToken({
      alias,
      fallback,
      subdomain,
      target,
      targetId,
      targetType,
      token: matches[0][1],
    });
  }

  let resolved = value;

  for (const match of matches) {
    const resolvedToken = await resolvePlaceholderToken({
      alias,
      fallback,
      subdomain,
      target,
      targetId,
      targetType,
      token: match[1],
    });

    resolved = resolved.replace(
      match[0],
      stringifyPlaceholderValue(resolvedToken, fallback),
    );
  }

  return resolved;
};

export const resolveRecordReferencePlaceholders = async ({
  alias,
  fallback = '',
  subdomain,
  target,
  targetId,
  targetType,
  value,
}: TResolveRecordReferencePlaceholdersProps): Promise<unknown> => {
  const targetAlias =
    alias ||
    getLocalRecordReferenceType(
      getRecordReferencePluginName(targetType),
      targetType,
    );

  if (typeof value === 'string') {
    return resolveStringPlaceholders({
      alias: targetAlias,
      fallback,
      subdomain,
      target,
      targetId,
      targetType,
      value,
    });
  }

  if (Array.isArray(value)) {
    return Promise.all(
      value.map((item) =>
        resolveRecordReferencePlaceholders({
          alias: targetAlias,
          fallback,
          subdomain,
          target,
          targetId,
          targetType,
          value: item,
        }),
      ),
    );
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      await Promise.all(
        Object.entries(value).map(async ([key, item]) => [
          key,
          await resolveRecordReferencePlaceholders({
            alias: targetAlias,
            fallback,
            subdomain,
            target,
            targetId,
            targetType,
            value: item,
          }),
        ]),
      ),
    );
  }

  return value;
};
