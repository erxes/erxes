import { useWatch } from 'react-hook-form';
import { useSegment } from '../context/SegmentProvider';
import {
  createFieldNameSafe,
  getSelectedFieldConfig,
} from '../utils/segmentFormUtils';
import { useGetFieldsProperties } from './useGetFieldsProperties';

type TConditionFieldName =
  | `conditionSegments.${number}.conditions.${number}`
  | `conditions.${number}`;

export const useSegmentProperty = ({
  index,
  parentFieldName,
}: {
  index: number;
  parentFieldName?: `conditionSegments.${number}`;
}) => {
  const { form } = useSegment();
  const conditionFieldName = createFieldNameSafe<TConditionFieldName>(
    parentFieldName,
    'conditions',
    index,
  );
  const condition = useWatch({
    control: form.control,
    name: conditionFieldName,
  });
  const { fields, propertyTypes, loading } = useGetFieldsProperties(
    condition?.propertyType,
  );
  const { selectedField, operators } =
    getSelectedFieldConfig(condition?.propertyName, fields) || {};

  return {
    fields,
    propertyTypes,
    loading,
    condition,
    selectedField,
    operators,
    conditionFieldName,
  };
};
