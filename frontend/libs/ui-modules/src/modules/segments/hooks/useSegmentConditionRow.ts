import { useMemo } from 'react';
import { FieldPath, useWatch } from 'react-hook-form';
import { useSegment } from '../context/SegmentProvider';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentNode,
  TSegmentOperator,
} from '../types';
import { emptyCondition } from '../types/segmentNode';
import { useSegmentFields } from './useSegmentFields';
import {
  TPropertyType,
  useSegmentPropertyTypes,
} from './useSegmentPropertyTypes';

/**
 * Everything one condition row needs to know about itself.
 *
 * A row is either a plain field on the subject or a measured relation, and the
 * difference decides which node the form writes and where the operator and
 * value live - on the relation for a count, on its child for a plain field of
 * the related type.
 */

const COUNT_KEY = '__count';
const SUM_PREFIX = '__sum:';

export const useSegmentConditionRow = (
  path: TNodePath,
  /**
   * The entity this row sits inside. Inside a relation's filters that is the
   * related type, not the segment's own - otherwise the row would offer the
   * subject's fields for records that are not the subject.
   */
  contextType?: string,
  /**
   * Replaces the row through its field array. `setValue` on an item path leaves
   * the array's own registration holding the previous operator and value, so a
   * changed field would keep comparing with the old one.
   */
  onReplace?: (next: TSegmentNode) => void,
) => {
  const { form, contentType: segmentType } = useSegment();
  const contentType = contextType || segmentType;
  const { propertyTypes, loading: typesLoading } =
    useSegmentPropertyTypes(contentType);

  const node = useWatch({
    control: form.control,
    name: path as FieldPath<TSegmentForm>,
  }) as TSegmentNode | undefined;

  // A relation node written by an older build may have no measure; treating it
  // as a plain row is better than throwing while the form renders.
  const isRelation = node?.kind === 'relation' && Boolean(node.measure);

  const selectedType: TPropertyType | undefined = isRelation
    ? propertyTypes.find((type) => type.relationKey === node.relationKey)
    : propertyTypes.find(
        (type) =>
          !type.relationKey &&
          type.contentType ===
            (node?.kind === 'field' ? node.contentType : contentType),
      );

  const { fields, loading: fieldsLoading } = useSegmentFields(
    selectedType?.contentType,
  );

  /** A relation offers what can be measured before what can be matched. */
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
            ...fields,
          ],
    [isRelation, fields, selectedType],
  );

  /** Which option the row currently shows in its field column. */
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

  /**
   * A measured relation compares its own number; a relation matched on one of
   * the related type's fields compares that child instead.
   */
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

  /** Switching entity discards a field and value that belonged to the old one. */
  const selectType = (type: TPropertyType) => {
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

    const relatedType = selectedType?.contentType || contentType;

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

    // A plain field of the related type asks whether any such record exists,
    // so the comparison moves onto the child.
    setNode({
      ...node,
      measure: { op: 'exists' },
      child: {
        kind: 'field',
        contentType: relatedType,
        fieldKey: option.key,
        operator: '',
      },
      operator: undefined,
      value: undefined,
    });
  };

  return {
    node,
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
