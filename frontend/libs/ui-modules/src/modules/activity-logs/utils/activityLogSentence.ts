export function formatActivityValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'empty';
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => formatActivityValue(item)).join(', ') : 'empty';
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;

    if (typeof record.text === 'string' && record.text) {
      return record.text;
    }

    if (typeof record.label === 'string' && record.label) {
      return record.label;
    }

    const primitiveValues = Object.values(record).filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== '' &&
        (typeof item === 'string' ||
          typeof item === 'number' ||
          typeof item === 'boolean'),
    );

    if (primitiveValues.length === 1) {
      return formatActivityValue(primitiveValues[0]);
    }

    if (primitiveValues.length > 1) {
      return primitiveValues.map((item) => formatActivityValue(item)).join(', ');
    }

    return JSON.stringify(value);
  }

  // Format ISO date strings to human-readable
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }

  return String(value);
}

export function getChangedValue(
  container: Record<string, unknown> | unknown,
  field?: string,
) {
  if (container === null || container === undefined) {
    return undefined;
  }

  if (typeof container !== 'object' || Array.isArray(container)) {
    return container;
  }

  if (!field) {
    return undefined;
  }

  return (container as Record<string, unknown>)[field];
}
