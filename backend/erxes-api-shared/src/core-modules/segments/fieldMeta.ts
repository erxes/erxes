import {
  SegmentOperator,
  SegmentOperatorSpec,
  SEGMENT_IMPLICIT_OPERATORS,
  SEGMENT_OPERATOR_SPECS,
} from './operators';

export type SegmentFieldOption = {
  value: string;
  label: string;
};

export type SegmentFieldQuery = {
  name: string;
  labelField: string;
  valueField?: string;
};

export const DEFAULT_SEGMENT_VALUE_FIELD = '_id';

export type SegmentFieldDependency = {
  contentType?: string;
  fields: string[];
  via?: string;
};

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
  operators: SegmentOperator[];
};

type SegmentFieldPresentation =
  | { input: 'text' | 'number' | 'date' | 'boolean' }
  | { input: 'select'; source: 'static'; options: SegmentFieldOption[] }
  | { input: 'select'; source: 'query'; query: SegmentFieldQuery }
  | { input: 'select'; source: 'component'; component: string };

export type SegmentFieldMeta = SegmentFieldIdentity &
  SegmentFieldSource &
  SegmentFieldPresentation;

/**
 * A group of fields nobody can enumerate at build time - a tenant's own
 * custom properties. The values live in one object on the record, keyed by
 * field id, so `prefix.<id>` reads and filters as the dotted path it is.
 */
export type SegmentFieldNamespace = {
  prefix: string;
  label: string;
  path: string;
};

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
