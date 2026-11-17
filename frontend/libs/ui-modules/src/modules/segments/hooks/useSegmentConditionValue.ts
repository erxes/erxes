import { TPropertyInputMeta } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ChangeEvent, useCallback, useMemo } from 'react';
import { FieldPath } from 'react-hook-form';
import { pluginsConfigState } from 'ui-modules/states';
import { useSegment } from '../context/SegmentProvider';
import {
  TNodePath,
  TSegmentField,
  TSegmentForm,
  TSegmentOperator,
} from '../types';
import {
  onlyStringMeta,
  segmentValueInputKind,
  segmentValueListQuery,
} from '../utils/segmentConditionValue';
import { useSegmentNodeValue } from './useSegmentNodeValue';

const DEFAULT_VALUE_FIELD = '_id';

/**
 * A condition's value input: which kind it is, the plugin's own input when
 * the field names one, and recounting the segment once a value settles.
 */
export const useSegmentConditionValue = ({
  path,
  field,
  fieldType,
  operator,
}: {
  path: TNodePath;
  field?: TSegmentField;
  fieldType?: string;
  operator?: TSegmentOperator;
}) => {
  const { form, contentType, stats } = useSegment();
  const { countSettled } = stats;
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const name = `${path}.value` as FieldPath<TSegmentForm>;
  const metaName = `${path}.meta` as FieldPath<TSegmentForm>;
  const meta = useSegmentNodeValue<Record<string, string>>(metaName);

  const [pluginName] = (fieldType || contentType).split(':');
  const CustomInput =
    field?.source === 'component' && field.component
      ? Object.values(pluginsConfig || {}).find(
          (config) => config.name === pluginName,
        )?.widgets?.propertyInputs?.[field.component]
      : undefined;

  const query = useMemo(() => {
    if (!field?.query) {
      return null;
    }

    const valueField = field.query.valueField || DEFAULT_VALUE_FIELD;

    return {
      document: segmentValueListQuery(
        field.query.name,
        field.query.labelField,
        valueField,
        field.query.variables,
      ),
      name: field.query.name,
      labelField: field.query.labelField,
      valueField,
      variables: field.query.variables,
    };
  }, [field?.query]);

  // A picked value is final, so the count follows at once
  const commit = useCallback(
    (onChange: (value: unknown) => void) => (next: unknown) => {
      onChange(next);
      countSettled();
    },
    [countSettled],
  );

  const typed = useCallback(
    (onChange: (value: unknown) => void) =>
      (event: ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value),
    [],
  );

  const changeMeta = useCallback(
    (next: TPropertyInputMeta) =>
      form.setValue(metaName, onlyStringMeta(next), { shouldDirty: true }),
    [form, metaName],
  );

  return {
    control: form.control,
    name,
    kind:
      field && operator
        ? segmentValueInputKind(field, operator, !!CustomInput)
        : null,
    CustomInput,
    meta,
    query,
    staticOptions: field?.options || [],
    textType: field?.input === 'number' ? 'number' : 'text',
    countSettled,
    commit,
    typed,
    changeMeta,
  };
};
