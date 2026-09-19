import dayjs from 'dayjs';
import _ from 'lodash';
import { JSONContent } from '../@types';

const collectIds = (node: JSONContent | undefined, ids: Set<string>): void => {
  if (!node) {
    return;
  }

  if (node.type === 'variable' && typeof node.attrs?.id === 'string') {
    ids.add(node.attrs.id);
  }

  for (const child of node.content || []) {
    collectIds(child, ids);
  }
};

export const collectEmailVariableIds = (contentJson: JSONContent): string[] => {
  const ids = new Set<string>();
  collectIds(contentJson, ids);
  return Array.from(ids);
};

export type VariableValueResolver = (
  replacer: Record<string, any>,
  path: string,
) => string;

export const defaultVariableValueResolver: VariableValueResolver = (
  replacer,
  path,
) => {
  const value = _.get(replacer, path);

  if (typeof value === 'number') {
    return value.toString();
  }

  if (value instanceof Date) {
    return dayjs(value).format('YYYY-MM-DD');
  }

  return value?.toString() || '-';
};

export const resolveEmailVariableValues = (
  contentJson: JSONContent,
  replacer: Record<string, any>,
  resolve: VariableValueResolver = defaultVariableValueResolver,
): Record<string, string> => {
  const values: Record<string, string> = {};

  for (const id of collectEmailVariableIds(contentJson)) {
    values[id] = resolve(replacer, id);
  }

  return values;
};
