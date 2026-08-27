import {
  SegmentFieldMeta,
  SegmentFieldOption,
  SegmentFieldQuery,
  SegmentOperator,
} from './fieldMeta';

/**
 * Shorthands for declaring segment fields.
 *
 * Every plugin declares the same handful of shapes, so the operator sets and
 * the boilerplate live here rather than being copied into each plugin's field
 * list. A field that does not fit one of these is written out in full.
 */

export const SEGMENT_TEXT_OPERATORS = [
  SegmentOperator.Equals,
  SegmentOperator.NotEquals,
  SegmentOperator.Contains,
  SegmentOperator.NotContains,
];

export const SEGMENT_ID_OPERATORS = [
  SegmentOperator.Equals,
  SegmentOperator.NotEquals,
];

export const SEGMENT_NUMBER_OPERATORS = [
  SegmentOperator.Equals,
  SegmentOperator.NumberGt,
  SegmentOperator.NumberLt,
];

export const SEGMENT_DATE_OPERATORS = [
  SegmentOperator.DateGte,
  SegmentOperator.DateLte,
  SegmentOperator.DaysAgo,
  SegmentOperator.DaysFromNow,
];

export const SEGMENT_BOOLEAN_OPERATORS = [
  SegmentOperator.IsTrue,
  SegmentOperator.IsFalse,
];

type Base = {
  key: string;
  label: string;
  /** Defaults to `key`; give it when the mongo path differs. */
  path?: string;
};

export const textField = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_TEXT_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'text',
});

export const numberField = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_NUMBER_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'number',
});

export const dateField = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_DATE_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'date',
});

export const booleanField = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_BOOLEAN_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'boolean',
});

/** A closed set of values known at build time. */
export const staticField = ({
  key,
  label,
  path,
  options,
}: Base & {
  options: readonly string[] | SegmentFieldOption[];
}): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_ID_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'select',
  source: 'static',
  options: options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  ),
});

/** An id picked from a searchable list query. */
export const lookupField = ({
  key,
  label,
  path,
  query,
}: Base & { query: SegmentFieldQuery }): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_ID_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'select',
  source: 'query',
  query,
});

/** An id picked through a plugin-owned input, for anything with its own UX. */
export const componentField = ({
  key,
  label,
  path,
  component,
}: Base & { component: string }): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_ID_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'select',
  source: 'component',
  component,
});
