import { JSON_PROPERTY_TYPE_OPTIONS } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';

type Path = Array<string | number>;

export function setAtJSONProperty(obj: any, path: Path, value: any): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const nextContainer = Array.isArray(obj)
    ? [...(obj ?? [])]
    : { ...(obj ?? {}) };
  (nextContainer as any)[head as any] = setAtJSONProperty(
    (nextContainer as any)[head as any],
    rest,
    value,
  );
  return nextContainer;
}

export function deleteAtJSONProperty(obj: any, path: Path): any {
  if (path.length === 0) return undefined;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    if (Array.isArray(obj)) {
      const idx = Number(head);
      return [...obj.slice(0, idx), ...obj.slice(idx + 1)];
    }
    const clone = { ...(obj ?? {}) } as Record<string, any>;
    delete clone[head as any];
    return clone;
  }
  const child = deleteAtJSONProperty(obj?.[head as any], rest);
  if (Array.isArray(obj)) {
    const idx = Number(head);
    const arr = [...obj];
    arr[idx] = child;
    return arr;
  }
  return { ...(obj ?? {}), [head as any]: child };
}

export function detectJSONPropertyValueType(
  value: any,
):
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'array'
  | 'object'
  | 'expression' {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

export function defaultPropertyValueForType(
  type: (typeof JSON_PROPERTY_TYPE_OPTIONS)[number],
): any {
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    case 'array':
      return [];
    case 'object':
      return {};
    case 'expression':
      return '';
    default:
      return '';
  }
}
