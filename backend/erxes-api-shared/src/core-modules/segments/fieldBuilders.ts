import { SegmentOperator } from './operators';
import {
  SegmentFieldMeta,
  SegmentFieldOption,
  SegmentFieldQuery,
} from './fieldMeta';

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
  SegmentOperator.AnniversaryToday,
  SegmentOperator.AnniversaryFromNow,
  SegmentOperator.AnniversaryAgo,
];

export const SEGMENT_BOOLEAN_OPERATORS = [
  SegmentOperator.IsTrue,
  SegmentOperator.IsFalse,
];

type Base = {
  key: string;
  label: string;
  path?: string;
};

const text = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_TEXT_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'text',
});

const number = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_NUMBER_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'number',
});

const date = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_DATE_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'date',
});

const boolean = ({ key, label, path }: Base): SegmentFieldMeta => ({
  key,
  label,
  operators: SEGMENT_BOOLEAN_OPERATORS,
  kind: 'projected',
  path: path || key,
  input: 'boolean',
});

const staticOptions = ({
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

const lookup = ({
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

const component = ({
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

/**
 * Builders for a content type's filterable fields.
 *
 * Namespaced because every call site is a list of one-liners, where a bare
 * `textField(...)` says nothing about what it is building.
 */
export const SegmentField = {
  text,
  number,
  date,
  boolean,
  static: staticOptions,
  lookup,
  component,
} as const;
