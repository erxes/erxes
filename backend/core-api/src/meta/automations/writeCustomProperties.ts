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
  code?: string | null;
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

const OPTION_BASED_TYPES = ['select', 'radio', 'check'];

const isEmptyValue = (value: unknown) =>
  value === null || value === undefined || value === '';

const normalizeForCompare = (value: unknown) =>
  Array.isArray(value)
    ? [...value].map(String).sort((a, b) => a.localeCompare(b))
    : value;

const isEqualValue = (a: unknown, b: unknown) => {
  const left = normalizeForCompare(a);
  const right = normalizeForCompare(b);

  return (
    Array.isArray(left) === Array.isArray(right) &&
    JSON.stringify(left) === JSON.stringify(right)
  );
};

const isValidNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  return typeof value === 'string' && value.trim() !== ''
    ? Number.isFinite(Number(value))
    : false;
};

const isValidDate = (value: unknown) =>
  value instanceof Date ||
  (typeof value === 'string' && !Number.isNaN(Date.parse(value)));

const isAllowedOption = (def: FieldDef, value: unknown) =>
  Boolean(def.options?.some((option) => option.value === value));

const isAllowedOptionArray = (def: FieldDef, value: unknown) => {
  const optionValues = new Set((def.options ?? []).map((o) => o.value));

  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((member) => optionValues.has(String(member)))
  );
};

const isTextual = (value: unknown) => typeof value === 'string';

/**
 * Per-field definition validation. Returns 'valid' or the skip reason.
 * Numeric coercion happens only at normalization time — booleans, arrays,
 * and other non-numeric shapes never validate.
 */
const validateFieldValue = (
  def: FieldDef,
  value: unknown,
): { ok: boolean; reason: string } => {
  switch (def.type) {
    case 'number': {
      return { ok: isValidNumber(value), reason: 'invalid-value' };
    }
    case 'date': {
      return { ok: isValidDate(value), reason: 'invalid-value' };
    }
    case 'select':
    case 'radio': {
      return {
        ok: isAllowedOption(def, value),
        reason: 'invalid-option',
      };
    }
    case 'check': {
      return {
        ok: isAllowedOptionArray(def, value),
        reason: 'invalid-option',
      };
    }
    case 'text':
    case 'textarea':
    case 'input': {
      const valid =
        def.validation === 'number' ? isValidNumber(value) : isTextual(value);

      return { ok: valid, reason: 'invalid-value' };
    }
    default: {
      return { ok: true, reason: '' };
    }
  }
};

/** Normalizes validated values for storage (numeric strings -> numbers). */
const normalizeFieldValue = (def: FieldDef, value: unknown) =>
  def.type === 'number' ? Number(value) : value;


type EntryOutcome =
  | { reason: string; storageKey?: undefined; normalized?: undefined }
  | { reason?: undefined; storageKey: string; normalized: unknown };

/** Applies the full policy to one submitted pair against current state. */
const evaluateEntry = (
  defByKey: Map<string, FieldDef>,
  current: Record<string, unknown>,
  entry: { field: string; value?: unknown },
): EntryOutcome => {
  const { field, value } = entry;
  const def = defByKey.get(field);

  if (!def || def.contentType !== CUSTOMERS_CONTENT_TYPE) {
    return { reason: 'unknown-field' };
  }

  const storageKey = String(def._id);
  const existing = current[storageKey];

  if (!isEmptyValue(existing) && isEmptyValue(value)) {
    return { reason: 'clear-not-allowed' };
  }

  if (isEmptyValue(existing) && isEmptyValue(value)) {
    return { reason: 'already-set' };
  }

  const validation = validateFieldValue(def, value);

  if (!validation.ok) {
    return { reason: validation.reason };
  }

  const normalized = normalizeFieldValue(def, value);

  if (existing != null) {
    return {
      reason: isEqualValue(existing, normalized) ? 'already-set' : 'conflict',
    };
  }

  return { storageKey, normalized };
};

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
  // original spelling so changedFields echoes what the caller sent, while
  // storage always uses the canonical field _id.
  const defByKey = new Map<string, FieldDef>();
  for (const def of definitions) {
    defByKey.set(String(def._id), def);
    if (typeof def.code === 'string') {
      defByKey.set(def.code, def);
    }
  }

  const skipped: Array<{ field: string; reason: string }> = [];
  const changedFields: string[] = [];
  const writes: Record<string, unknown> = {};

  for (const entry of input.values) {
    const outcome = evaluateEntry(defByKey, current, entry);

    if (outcome.reason) {
      skipped.push({ field: entry.field, reason: outcome.reason });
      continue;
    }

    writes[outcome.storageKey as string] = outcome.normalized;
    changedFields.push(entry.field);
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
