import { useMemo } from 'react';
import { FieldPath } from 'react-hook-form';
import { useSegment } from '../context/SegmentProvider';
import { useSegmentScope } from '../context/SegmentScopeProvider';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentNode,
  TSegmentOperator,
} from '../types';
import { emptyCondition, emptySegmentReference } from '../types/segmentNode';
import { useSegmentFields } from './useSegmentFields';
import { useSegmentNodeValue } from './useSegmentNodeValue';
import {
  TPropertyType,
  useSegmentPropertyTypes,
} from './useSegmentPropertyTypes';

const COUNT_KEY = '__count';
const SUM_PREFIX = '__sum:';

export const SEGMENT_TYPE_KEY = '__segment';

const pluginBehind = (node?: TSegmentNode): string | undefined => {
  if (!node) {
    return undefined;
  }

  if (node.kind === 'field') {
    return node.contentType.split(':')[0];
  }

  return node.kind === 'relation' ? pluginBehind(node.child) : undefined;
};

export const useSegmentConditionRow = (
  path: TNodePath,
  onReplace?: (next: TSegmentNode) => void,
) => {
  const { form } = useSegment();
  const { contentType, nested } = useSegmentScope();
  const { propertyTypes: entityTypes, loading: typesLoading } =
    useSegmentPropertyTypes(contentType);

  const node = useSegmentNodeValue<TSegmentNode>(path);

  const isReference = node?.kind === 'segment';

  const propertyTypes: TPropertyType[] = useMemo(
    () =>
      nested
        ? entityTypes
        : [...entityTypes, { contentType: SEGMENT_TYPE_KEY, label: 'Segment' }],
    [entityTypes, nested],
  );

  const isRelation = node?.kind === 'relation' && Boolean(node.measure);

  const selectedType: TPropertyType | undefined = isReference
    ? propertyTypes.find((type) => type.contentType === SEGMENT_TYPE_KEY)
    : isRelation
      ? propertyTypes.find((type) => type.relationKey === node.relationKey)
      : propertyTypes.find(
          (type) =>
            !type.relationKey &&
            type.contentType ===
              (node?.kind === 'field' ? node.contentType : contentType),
        );

  const { fields, loading: fieldsLoading } = useSegmentFields(
    isReference ? undefined : selectedType?.contentType,
  );

  const options: TSegmentField[] = useMemo(
    () =>
      !isRelation
        ? fields
        : [
            {
              key: COUNT_KEY,
              label: 'Count',
              kind: 'projected' as const,
              input: 'number' as const,
              operators: selectedType?.measureOperators || [],
            },
            ...fields
              .filter((field) => field.input === 'number')
              .map((field) => ({
                key: `${SUM_PREFIX}${field.key}`,
                label: `Sum of ${field.label.toLowerCase()}`,
                kind: 'projected' as const,
                input: 'number' as const,
                operators: selectedType?.measureOperators || [],
              })),
          ],
    [isRelation, fields, selectedType],
  );

  const selectedKey = isRelation
    ? node.measure.op === 'count'
      ? COUNT_KEY
      : node.measure.op === 'sum'
        ? `${SUM_PREFIX}${node.measure.fieldKey}`
        : node.child?.kind === 'field'
          ? node.child.fieldKey
          : ''
    : node?.kind === 'field'
      ? node.fieldKey
      : '';

  const selectedField = options.find((option) => option.key === selectedKey);

  const isMeasure =
    isRelation && (node.measure.op === 'count' || node.measure.op === 'sum');

  const comparisonPath: TNodePath =
    isRelation && !isMeasure ? `${path}.child` : path;

  const operatorValue = isRelation
    ? isMeasure
      ? node.operator
      : node.child?.kind === 'field'
        ? node.child.operator
        : undefined
    : node?.kind === 'field'
      ? node.operator
      : undefined;

  const operator: TSegmentOperator | undefined = selectedField?.operators.find(
    (candidate) => candidate.value === operatorValue,
  );

  const setNode = (next: TSegmentNode) => {
    if (onReplace) {
      onReplace(next);
      return;
    }

    form.setValue(path as FieldPath<TSegmentForm>, next, {
      shouldDirty: true,
    });
  };

  const selectType = (type: TPropertyType) => {
    if (type.contentType === SEGMENT_TYPE_KEY) {
      setNode(emptySegmentReference());
      return;
    }

    if (!type.relationKey) {
      setNode(emptyCondition(type.contentType));
      return;
    }

    setNode({
      kind: 'relation',
      relationKey: type.relationKey,
      measure: { op: 'count' },
    });
  };

  const selectField = (option: TSegmentField) => {
    if (!isRelation) {
      setNode({
        kind: 'field',
        contentType: selectedType?.contentType || contentType,
        fieldKey: option.key,
        operator: '',
        value: undefined,
      });
      return;
    }

    if (option.key === COUNT_KEY) {
      setNode({
        ...node,
        measure: { op: 'count' },
        operator: '',
        value: undefined,
      });
      return;
    }

    if (option.key.startsWith(SUM_PREFIX)) {
      setNode({
        ...node,
        measure: { op: 'sum', fieldKey: option.key.slice(SUM_PREFIX.length) },
        operator: '',
        value: undefined,
      });
      return;
    }
  };

  const unavailable =
    !typesLoading && node && !isReference && !selectedType
      ? { pluginName: pluginBehind(node) }
      : null;

  return {
    node,
    unavailable,
    isReference,
    isRelation,
    isMeasure,
    propertyTypes,
    selectedType,
    options,
    selectedField,
    operator,
    comparisonPath,
    selectType,
    selectField,
    loading: typesLoading || fieldsLoading,
  };
};
