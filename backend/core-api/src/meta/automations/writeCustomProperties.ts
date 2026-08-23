// Pure policy engine behind the core "Write custom properties" automation
// action and the customers.captureProperties tRPC procedure. Persists custom
// property values onto a customer's authoritative `propertiesData` object
// with code-enforced guarantees:
//
//  - every value validated against its Field definition (type / options)
//  - fill-only merge: already-set values are skipped, differing values are
//    never silently overwritten, clearing filled fields is refused
//  - at most one update call, preserving unrelated pre-existing entries
//  - idempotent: repeating identical data saves nothing
//
// The deps object keeps the policy unit-testable and transport-agnostic:
// the tRPC procedure injects mongoose models, the automation action injects
// model-backed resolvers.

interface FieldDef {
  _id: string;
  contentType?: string | null;
  type?: string | null;
  validation?: string | null;
  options?: Array<{ value: string }> | null;
}

type PropertiesDataCarrier = {
  propertiesData?: Record<string, unknown> | null;
};

export interface WriteCustomPropertiesDeps {
  getCustomer(
    customerId: string,
  ): Promise<PropertiesDataCarrier | null>;
  findFields(query: Record<string, unknown>): Promise<FieldDef[]>;
  updateCustomer(
    customerId: string,
    doc: Record<string, unknown>,
  ): Promise<unknown>;
}

export interface WriteCustomPropertiesInput {
  customerId: string;
  // zod's z.unknown() renders optional; empties are handled by policy.
  values: Array<{ field: string; value?: unknown }>;
}

export interface WriteCustomPropertiesResult {
  saved: boolean;
  changedFields: string[];
  skipped: Array<{ field: string; reason: string }>;
}

const CUSTOMERS_CONTENT_TYPE = 'core:customer';

const isEmptyValue = (value: unknown) =>
  value === null || value === undefined || value === '';

const isEqualValue = (a: unknown, b: unknown) => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  }
  return a === b;
};

const isValidNumber = (value: unknown) =>
  typeof value === 'number'
    ? Number.isFinite(value)
    : typeof value === 'string' && value.trim() !== ''
      ? Number.isFinite(Number(value))
      : false;

export const writeCustomProperties = async (
  deps: WriteCustomPropertiesDeps,
  input: WriteCustomPropertiesInput,
): Promise<WriteCustomPropertiesResult> => {
  const customer = await deps.getCustomer(input.customerId);

  if (!customer) {
    throw new Error('Customer not found');
  }

  const current: Record<string, unknown> = customer.propertiesData ?? {};

  const submitted = input.values.map((v) => v.field);
  const definitions =
    (await deps.findFields({
      $or: [{ _id: { $in: submitted } }, { code: { $in: submitted } }],
    })) ?? [];

  // Definitions resolve by both _id and code; submitted keys keep their
  // original spelling so changedFields echoes what the caller sent.
  const defByKey = new Map<string, FieldDef>();
  for (const def of definitions) {
    defByKey.set(String(def._id), def);
    if (typeof (def as { code?: unknown }).code === 'string') {
      defByKey.set((def as unknown as { code: string }).code, def);
    }
  }

  const skipped: Array<{ field: string; reason: string }> = [];
  const changedFields: string[] = [];
  const writes: Record<string, unknown> = {};
  const skip = (field: string, reason: string) =>
    skipped.push({ field, reason });

  for (const { field, value } of input.values) {
    const def = defByKey.get(field);

    if (!def || def.contentType !== CUSTOMERS_CONTENT_TYPE) {
      skip(field, 'unknown-field');
      continue;
    }

    const storageKey = String(def._id);
    const hasCurrent =
      Object.prototype.hasOwnProperty.call(current, storageKey) &&
      !isEmptyValue(current[storageKey]);

    if (hasCurrent && isEmptyValue(value)) {
      skip(field, 'clear-not-allowed');
      continue;
    }

    if (!hasCurrent && isEmptyValue(value)) {
      skip(field, 'already-set');
      continue;
    }

    let valid = false;

    switch (def.type) {
      case 'number': {
        valid = isValidNumber(value);
        break;
      }
      case 'date': {
        valid =
          value instanceof Date ||
          (typeof value === 'string' && !Number.isNaN(Date.parse(value)));
        break;
      }
      case 'select':
      case 'radio': {
        valid = Boolean(def.options?.some((option) => option.value === value));
        break;
      }
      case 'check': {
        const optionValues = new Set(
          (def.options ?? []).map((option) => option.value),
        );
        valid =
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((member) => optionValues.has(String(member)));
        break;
      }
      case 'text':
      case 'textarea':
      case 'input': {
        valid =
          def.validation === 'number'
            ? isValidNumber(value)
            : typeof value === 'string';
        break;
      }
      default: {
        valid = true;
      }
    }

    if (!valid) {
      const optionBased = ['select', 'radio', 'check'].includes(def.type ?? '');
      skip(field, optionBased ? 'invalid-option' : 'invalid-value');
      continue;
    }

    const normalized = def.type === 'number' ? Number(value) : value;

    // Always compare and store under the canonical field _id so lookups by
    // code cannot create duplicate keys.
    const existing = current[storageKey];

    if (existing !== undefined && existing !== null) {
      skip(
        field,
        isEqualValue(existing, normalized) ? 'already-set' : 'conflict',
      );
      continue;
    }

    writes[storageKey] = normalized;
    changedFields.push(field);
  }

  if (changedFields.length) {
    await deps.updateCustomer(input.customerId, {
      propertiesData: { ...current, ...writes },
    });
  }

  return {
    saved: changedFields.length > 0,
    changedFields,
    skipped,
  };
};
