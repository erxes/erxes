import { NodeData } from '@/automations/types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isEqualArray = (first: unknown[], second: unknown[]): boolean =>
  first.length === second.length &&
  first.every((item, index) => isEqualConfig(item, second[index]));

const isEqualRecord = (
  first: Record<string, unknown>,
  second: Record<string, unknown>,
): boolean => {
  const firstKeys = Object.keys(first);

  return (
    firstKeys.length === Object.keys(second).length &&
    firstKeys.every((key) => isEqualConfig(first[key], second[key]))
  );
};

/** Deep equality for plain config values: objects, arrays and primitives. */
export const isEqualConfig = (first: unknown, second: unknown): boolean => {
  if (Object.is(first, second)) {
    return true;
  }

  if (Array.isArray(first) || Array.isArray(second)) {
    return (
      Array.isArray(first) &&
      Array.isArray(second) &&
      isEqualArray(first, second)
    );
  }

  return (
    isPlainObject(first) &&
    isPlainObject(second) &&
    isEqualRecord(first, second)
  );
};

/** Whether an action node's content would draw the same for both props. */
export const isSameActionNodeContent = (
  { data: previous }: { data: NodeData },
  { data: next }: { data: NodeData },
) =>
  previous.id === next.id &&
  previous.nodeIndex === next.nodeIndex &&
  previous.formPath === next.formPath &&
  previous.type === next.type &&
  previous.error === next.error &&
  previous.isCustom === next.isCustom &&
  isEqualConfig(previous.config, next.config);
