/**
 * Segment field + operator declaration contract.
 *
 * Plugins declare which fields are filterable and which operators each field
 * accepts. The UI renders from this declaration instead of guessing operators
 * from a field's type, and the segment engine reads `path`/`dependsOn` to know
 * which events invalidate which segments.
 */

export enum SegmentOperator {
  Equals = 'e',
  NotEquals = 'dne',
  Contains = 'c',
  NotContains = 'dnc',

  IsSet = 'is',
  IsNotSet = 'ins',

  IsTrue = 'it',
  IsFalse = 'if',

  /**
   * Membership in a list. Not offered on its own - it is what a derived
   * condition becomes once it has been resolved to concrete ids, and an empty
   * list means "nothing matches" rather than "no condition".
   */
  In = 'in',
  NotIn = 'nin',

  NumberGt = 'numberigt',
  NumberLt = 'numberilt',

  DateGte = 'dateigt',
  DateLte = 'dateilt',

  /** `wob*` resolves to a future instant, `woa*` to a past one. */
  MinutesFromNow = 'wobm',
  MinutesAgo = 'woam',
  DaysFromNow = 'wobd',
  DaysAgo = 'woad',

  /** @deprecated identical `exists` query as {@link SegmentOperator.IsSet} */
  DateIsSet = 'dateis',
  /** @deprecated identical `exists` query as {@link SegmentOperator.IsNotSet} */
  DateIsNotSet = 'dateins',
  /** @deprecated handled together with {@link SegmentOperator.Equals} */
  NumberEquals = 'numbere',
  /** @deprecated handled together with {@link SegmentOperator.NotEquals} */
  NumberNotEquals = 'numberdne',
  /** @deprecated same `lte` range as {@link SegmentOperator.DateLte} */
  DateRelativeLt = 'drlt',
  /** @deprecated same `gte` range as {@link SegmentOperator.DateGte} */
  DateRelativeGt = 'drgt',
}

/**
 * What the operator needs from the user:
 * - `none`   — the operator is self-contained (presence, boolean)
 * - `field`  — the field's own input (text box, date picker, select...)
 * - `number` — a plain count, regardless of the field's own input. `woad` on a
 *   date field means "n days ago", so a date picker would be wrong here.
 */
export type SegmentOperatorInput = 'none' | 'field' | 'number';

export type SegmentOperatorSpec = {
  value: SegmentOperator;
  label: string;
  input: SegmentOperatorInput;
  deprecated?: SegmentOperator;
};

export const SEGMENT_OPERATOR_SPECS: Record<
  SegmentOperator,
  SegmentOperatorSpec
> = {
  [SegmentOperator.Equals]: {
    value: SegmentOperator.Equals,
    label: 'equals to',
    input: 'field',
  },
  [SegmentOperator.NotEquals]: {
    value: SegmentOperator.NotEquals,
    label: 'is not equal to',
    input: 'field',
  },
  [SegmentOperator.Contains]: {
    value: SegmentOperator.Contains,
    label: 'contains',
    input: 'field',
  },
  [SegmentOperator.NotContains]: {
    value: SegmentOperator.NotContains,
    label: 'does not contain',
    input: 'field',
  },
  [SegmentOperator.IsSet]: {
    value: SegmentOperator.IsSet,
    label: 'is set',
    input: 'none',
  },
  [SegmentOperator.IsNotSet]: {
    value: SegmentOperator.IsNotSet,
    label: 'is not set',
    input: 'none',
  },
  [SegmentOperator.IsTrue]: {
    value: SegmentOperator.IsTrue,
    label: 'is true',
    input: 'none',
  },
  [SegmentOperator.IsFalse]: {
    value: SegmentOperator.IsFalse,
    label: 'is false',
    input: 'none',
  },
  [SegmentOperator.In]: {
    value: SegmentOperator.In,
    label: 'is any of',
    input: 'field',
  },
  [SegmentOperator.NotIn]: {
    value: SegmentOperator.NotIn,
    label: 'is none of',
    input: 'field',
  },
  [SegmentOperator.NumberGt]: {
    value: SegmentOperator.NumberGt,
    label: 'is greater than or equal to',
    input: 'field',
  },
  [SegmentOperator.NumberLt]: {
    value: SegmentOperator.NumberLt,
    label: 'is less than or equal to',
    input: 'field',
  },
  [SegmentOperator.DateGte]: {
    value: SegmentOperator.DateGte,
    label: 'is on or after',
    input: 'field',
  },
  [SegmentOperator.DateLte]: {
    value: SegmentOperator.DateLte,
    label: 'is on or before',
    input: 'field',
  },
  [SegmentOperator.MinutesFromNow]: {
    value: SegmentOperator.MinutesFromNow,
    label: 'minute(s) before',
    input: 'number',
  },
  [SegmentOperator.MinutesAgo]: {
    value: SegmentOperator.MinutesAgo,
    label: 'minute(s) later',
    input: 'number',
  },
  [SegmentOperator.DaysFromNow]: {
    value: SegmentOperator.DaysFromNow,
    label: 'day(s) before',
    input: 'number',
  },
  [SegmentOperator.DaysAgo]: {
    value: SegmentOperator.DaysAgo,
    label: 'day(s) later',
    input: 'number',
  },

  [SegmentOperator.DateIsSet]: {
    value: SegmentOperator.DateIsSet,
    label: 'is set',
    input: 'none',
    deprecated: SegmentOperator.IsSet,
  },
  [SegmentOperator.DateIsNotSet]: {
    value: SegmentOperator.DateIsNotSet,
    label: 'is not set',
    input: 'none',
    deprecated: SegmentOperator.IsNotSet,
  },
  [SegmentOperator.NumberEquals]: {
    value: SegmentOperator.NumberEquals,
    label: 'equals to',
    input: 'field',
    deprecated: SegmentOperator.Equals,
  },
  [SegmentOperator.NumberNotEquals]: {
    value: SegmentOperator.NumberNotEquals,
    label: 'is not equal to',
    input: 'field',
    deprecated: SegmentOperator.NotEquals,
  },
  [SegmentOperator.DateRelativeLt]: {
    value: SegmentOperator.DateRelativeLt,
    label: 'is on or before',
    input: 'field',
    deprecated: SegmentOperator.DateLte,
  },
  [SegmentOperator.DateRelativeGt]: {
    value: SegmentOperator.DateRelativeGt,
    label: 'is on or after',
    input: 'field',
    deprecated: SegmentOperator.DateGte,
  },
};

/** Presence applies to every field, so declarations never repeat these. */
export const SEGMENT_IMPLICIT_OPERATORS: SegmentOperator[] = [
  SegmentOperator.IsSet,
  SegmentOperator.IsNotSet,
];

export type SegmentFieldOption = {
  value: string;
  label: string;
};

export type SegmentFieldQuery = {
  /** Repo-wide unique list query name taking `searchValue` + cursor params. */
  name: string;
  labelField: string;
  /** Defaults to {@link DEFAULT_SEGMENT_VALUE_FIELD}. */
  valueField?: string;
};

export const DEFAULT_SEGMENT_VALUE_FIELD = '_id';

/**
 * What invalidates a field's value. `contentType` is omitted for the subject's
 * own document; a value read from another collection names that collection.
 */
export type SegmentFieldDependency = {
  contentType?: string;
  fields: string[];
};

/**
 * Where the value comes from. `projected` reads a path off the subject and
 * defaults its own dependency; `derived` is answered by the plugin's
 * `evaluateFields` producer, which cannot tell the dispatcher when to re-run,
 * so the declaration has to.
 */
type SegmentFieldSource =
  | {
      kind: 'projected';
      path: string;
      dependsOn?: SegmentFieldDependency[];
    }
  | {
      kind: 'derived';
      dependsOn: SegmentFieldDependency[];
    };

type SegmentFieldIdentity = {
  key: string;
  label: string;
  /** Declared operators; projected fields also get the presence operators. */
  operators: SegmentOperator[];
};

/** A select field resolves its choices from exactly one source. */
type SegmentFieldPresentation =
  | { input: 'text' | 'number' | 'date' | 'boolean' }
  | { input: 'select'; source: 'static'; options: SegmentFieldOption[] }
  | { input: 'select'; source: 'query'; query: SegmentFieldQuery }
  | { input: 'select'; source: 'component'; component: string };

export type SegmentFieldMeta = SegmentFieldIdentity &
  SegmentFieldSource &
  SegmentFieldPresentation;

/**
 * A key-value namespace whose keys are tenant data, not code: custom
 * properties, tracked data. The entries live in an array of
 * `{ field, value, ... }` documents, so a field key like
 * `trackedData.company_plan` means "the entry whose `field` is company_plan".
 *
 * Declared once per namespace instead of enumerating keys, which no plugin
 * could do - the keys differ per tenant.
 */
export type SegmentFieldNamespace = {
  /** First segment of the field key, e.g. `trackedData`. */
  prefix: string;
  label: string;
  /** Mongo path of the array holding the entries. */
  path: string;
  /** Sub-field holding the key. */
  keyPath: string;
  /** Sub-field holding the value. */
  valuePath: string;
};

/**
 * A traversal the UI can offer generically, so a user picks any field of the
 * related type. Named capabilities do not use this - they declare a derived
 * field and answer with their own query.
 */
export type SegmentRelationMeta = {
  /** Stable key a node points at, e.g. `customer.deals`. */
  key: string;
  /** What the picker calls it, e.g. `Deals`. */
  label: string;
  /** Segment content types, e.g. `core:contacts.customers`. */
  subjectType: string;
  relatedType: string;
  join:
    | {
        via: 'relation';
        /**
         * How the two ends are named in core's relation records, which is its
         * own naming and need not match the segment content types. Declared
         * rather than reused, because one field serving both meant a rename on
         * either side silently broke the other.
         */
        subjectRecordType: string;
        relatedRecordType: string;
      }
    /** `on` says which side carries `path`: the subject or the related doc. */
    | { via: 'field'; on: 'subject' | 'related'; path: string };
};

/**
 * Presence describes a stored path, so only projected fields get it for free.
 * A derived value is always computed; a plugin that still wants "is not set"
 * declares it alongside the rest.
 */
export const resolveSegmentFieldOperators = (
  field: SegmentFieldMeta,
): SegmentOperatorSpec[] => {
  if (field.kind === 'derived') {
    return field.operators.map((operator) => SEGMENT_OPERATOR_SPECS[operator]);
  }

  const declared = field.operators.filter(
    (operator) => !SEGMENT_IMPLICIT_OPERATORS.includes(operator),
  );

  return [...declared, ...SEGMENT_IMPLICIT_OPERATORS].map(
    (operator) => SEGMENT_OPERATOR_SPECS[operator],
  );
};

export const resolveSegmentFieldDependencies = (
  field: SegmentFieldMeta,
): SegmentFieldDependency[] => {
  if (field.dependsOn?.length) {
    return field.dependsOn;
  }

  return field.kind === 'projected' ? [{ fields: [field.path] }] : [];
};

export const resolveSegmentValueField = (query: SegmentFieldQuery): string =>
  query.valueField || DEFAULT_SEGMENT_VALUE_FIELD;

/** Maps a stored operator onto its canonical replacement, if any. */
export const normalizeSegmentOperator = (
  operator: SegmentOperator,
): SegmentOperator => SEGMENT_OPERATOR_SPECS[operator]?.deprecated || operator;
