import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { PROPERTY_OPERATOR } from '@/automations/constants';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { getFieldsProperties, groupFieldsByType } from 'ui-modules';

export const useManagePropertyRule = ({
  propertyType,
  index,
  rule,
}: {
  propertyType: string;
  index: number;
  rule: TManagePropertiesForm['rules'][number];
}) => {
  const { control } = useFormContext<TManagePropertiesForm>();
  const { fields = [] } = getFieldsProperties(propertyType);
  const { remove } = useFieldArray({
    control,
    name: 'rules',
  });
  const groups = groupFieldsByType(fields || []);

  const handleRemove = () => remove(index);

  const selectedField = fields.find((f) => f.name === rule.field);

  const operatorType = selectedField?.name?.includes('customFieldsData')
    ? (selectedField?.validation as string) || 'String'
    : (selectedField?.type as string) || 'Default';

  const operators =
    PROPERTY_OPERATOR[
      (operatorType as unknown as keyof typeof PROPERTY_OPERATOR) || 'Default'
    ] || PROPERTY_OPERATOR.Default;

  return {
    control,
    operators,
    operatorType,
    selectedField,
    groups,
    handleRemove,
  };
};
