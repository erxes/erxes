import { JSON_PROPERTY_TYPE_OPTIONS } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  defaultPropertyValueForType,
  detectJSONPropertyValueType,
  setAtJSONProperty,
} from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { ChangeEvent, FocusEvent, useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export type TJSONBodyPath = Array<string | number>;
type TJSONPropertyType = (typeof JSON_PROPERTY_TYPE_OPTIONS)[number];
type TJSONObject = Record<string, unknown>;

/** Writes a value at a path inside the body field, marking it edited. */
const useApplyAtPath = (name: string, path: TJSONBodyPath) => {
  const { getValues, setValue } = useFormContext();

  return useCallback(
    (next: unknown) => {
      const root = setAtJSONProperty(getValues(), path, next);

      setValue(name, root[name], { shouldDirty: true, shouldTouch: true });
    },
    [getValues, setValue, name, path],
  );
};

const withoutKey = (value: TJSONObject, key: string) =>
  Object.fromEntries(Object.entries(value).filter(([entry]) => entry !== key));

const renamedKey = (value: TJSONObject, oldKey: string, nextKey: string) => ({
  ...withoutKey(value, oldKey),
  [nextKey]: value[oldKey],
});

const summaryOf = (type: string, value: unknown) => {
  if (type === 'object') {
    return `{ ${Object.keys((value as TJSONObject) || {}).length} keys }`;
  }

  if (type === 'array') {
    return `[ ${Array.isArray(value) ? value.length : 0} items ]`;
  }

  if (type === 'null') {
    return 'null';
  }

  return type === 'boolean' ? String(Boolean(value)) : String(value ?? '');
};

/** An object's fields: adding one by key, renaming and listing them. */
export const useJSONObjectContainer = (
  name: string,
  path: TJSONBodyPath,
  value: TJSONObject,
) => {
  const apply = useApplyAtPath(name, path);
  const [newKey, setNewKey] = useState('');
  const current = value ?? {};

  const entries = useMemo(
    () =>
      Object.entries(current).map(([key, child]) => ({
        key,
        path: [...path, key],
        value: child,
      })),
    [current, path],
  );

  const onNewKeyChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setNewKey(event.target.value),
    [],
  );

  const addField = useCallback(() => {
    if (!newKey) {
      return;
    }

    apply({ ...current, [newKey]: '' });
    setNewKey('');
  }, [apply, newKey, current]);

  // Renamed when the key input loses focus with a different, non-empty key
  const renameOnBlur = useCallback(
    (oldKey: string) => (event: FocusEvent<HTMLInputElement>) => {
      const nextKey = event.target.value;

      if (nextKey && nextKey !== oldKey) {
        apply(renamedKey(current, oldKey, nextKey));
      }
    },
    [apply, current],
  );

  return {
    entries,
    isEmpty: !entries.length,
    newKey,
    onNewKeyChange,
    addField,
    renameOnBlur,
  };
};

/** An array's items, and appending an empty one. */
export const useJSONArrayContainer = (
  name: string,
  path: TJSONBodyPath,
  value: unknown[],
) => {
  const apply = useApplyAtPath(name, path);
  const current = value ?? [];

  const items = useMemo(
    () =>
      current.map((item, index) => ({
        key: index,
        path: [...path, index],
        value: item,
      })),
    [current, path],
  );

  const addItem = useCallback(() => apply([...current, '']), [apply, current]);

  return { items, isEmpty: !items.length, addItem };
};

/** One node: its detected type, changing it, expanding nested values. */
export const useJSONTreeNode = (
  name: string,
  path: TJSONBodyPath,
  value: unknown,
) => {
  const apply = useApplyAtPath(name, path);
  const type = useMemo(() => detectJSONPropertyValueType(value), [value]);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(
    () => setExpanded((current) => !current),
    [],
  );

  const onChangeType = useCallback(
    (next: string) =>
      apply(defaultPropertyValueForType(next as TJSONPropertyType)),
    [apply],
  );

  return {
    type,
    apply,
    expanded,
    toggleExpanded,
    toggleLabelKey: expanded ? 'webhook-json-collapse' : 'webhook-json-expand',
    onChangeType,
    summary: summaryOf(type, value),
    canExpand: type === 'object' || type === 'array',
    canRemove: path.length > 1,
    objectValue: (value ?? {}) as TJSONObject,
    arrayValue: Array.isArray(value) ? value : [],
  };
};
