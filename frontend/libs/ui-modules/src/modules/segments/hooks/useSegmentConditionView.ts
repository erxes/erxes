import { useIsMobile } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSegment } from '../context/SegmentProvider';
import { TNodePath, TSegmentField, TSegmentForm, TSegmentNode } from '../types';
import { TPropertyType } from './useSegmentPropertyTypes';
import {
  SEGMENT_TYPE_KEY,
  useSegmentConditionRow,
} from './useSegmentConditionRow';
import { useSegmentLabels } from './useSegmentLabels';

// The workspace's own Data Extensions first, then the type's built-in fields
// and custom properties, each under a heading: a long list of built-ins would
// otherwise hide what the workspace added below the fold
const PROPERTY_GROUPS = [
  { key: 'dataExtensions', prefix: 'dataExtensions.' },
  { key: 'properties', prefix: 'propertiesData.' },
];
const PROPERTY_GROUP_ORDER = ['dataExtensions', 'fields', 'properties'];

const groupOf = (option: TSegmentField) =>
  PROPERTY_GROUPS.find(({ prefix }) => option.key.includes(prefix))?.key ||
  'fields';

const typeValueOf = (type: TPropertyType) =>
  type.relationKey || type.contentType;

/**
 * One condition row as drawn: the record types to pick from, the properties
 * grouped and labelled, the operators of the chosen property, and whether a
 * value is asked for. Changing the operator clears the value and recounts.
 */
export const useSegmentConditionView = (
  path: TNodePath,
  onReplace: (next: TSegmentNode) => void,
) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { form, stats } = useSegment();
  const row = useSegmentConditionRow(path, onReplace);
  const { fieldLabel, operatorLabel, operatorHint, typeLabel } =
    useSegmentLabels();
  const stepped = useIsMobile();
  const { propertyTypes, selectedType, options, selectedField, operator } = row;
  const fieldType = selectedType?.contentType;

  const typeOptions = useMemo(
    () =>
      propertyTypes.map((option) => ({
        value: typeValueOf(option),
        label:
          option.contentType === SEGMENT_TYPE_KEY
            ? t('segment-membership')
            : typeLabel(option),
      })),
    [propertyTypes, t, typeLabel],
  );

  const propertyGroups = useMemo(
    () =>
      PROPERTY_GROUP_ORDER.map((key) => ({
        key,
        options: options
          .filter((option) => groupOf(option) === key)
          .map((option) => ({
            option,
            label: fieldLabel(fieldType, option),
          })),
      })).filter((group) => group.options.length),
    [options, fieldLabel, fieldType],
  );

  const onTypeChange = useCallback(
    (next: string) => {
      const type = propertyTypes.find(
        (candidate) => typeValueOf(candidate) === next,
      );

      if (type) {
        row.selectType(type);
      }
    },
    [propertyTypes, row],
  );

  const changeOperator = useCallback(
    (onChange: (value: string) => void) => (next: string) => {
      onChange(next);
      form.setValue(
        `${row.comparisonPath}.value` as FieldPath<TSegmentForm>,
        undefined,
      );
      stats.countSettled();
    },
    [form, row.comparisonPath, stats],
  );

  return {
    ...row,
    stepped,
    fieldType,
    hasTypeChoice: propertyTypes.length > 1,
    typeOptions,
    selectedTypeValue: selectedType ? typeValueOf(selectedType) : '',
    selectedTypeLabel: selectedType ? typeLabel(selectedType) : '',
    selectedFieldLabel: selectedField && fieldLabel(fieldType, selectedField),
    propertyGroups,
    operatorName: `${row.comparisonPath}.operator` as FieldPath<TSegmentForm>,
    operatorOptions: (selectedField?.operators || []).map((option) => ({
      value: option.value,
      label: operatorLabel(option),
    })),
    operatorHint: operatorHint(operator),
    hasValue: !!(selectedField && operator && operator.input !== 'none'),
    unavailableMessage: row.unavailable?.pluginName
      ? t('plugin-disabled', { plugin: row.unavailable.pluginName })
      : t('condition-unavailable'),
    control: form.control,
    onTypeChange,
    changeOperator,
  };
};
