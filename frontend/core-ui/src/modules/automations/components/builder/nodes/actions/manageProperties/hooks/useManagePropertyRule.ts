import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { PROPERTY_OPERATOR } from '@/automations/constants';
import { useCallback, useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useGetFieldsProperties, groupFieldsByType, IField } from 'ui-modules';

export const useManagePropertyRule = ({
  propertyType,
  index,
}: {
  propertyType: string;
  index: number;
}) => {
  const { control, setValue } = useFormContext<TManagePropertiesForm>();
  const rule = useWatch({ control, name: `rules.${index}` });
  const { fields = [] } = useGetFieldsProperties(propertyType);

  const selectedField = fields.find((f) => f.name === rule?.field);
  const operatorType = selectedField?.name?.includes('customFieldsData')
    ? (selectedField?.validation as string) || 'String'
    : (selectedField?.type as string) || 'Default';

  const operators =
    PROPERTY_OPERATOR[
      (operatorType as unknown as keyof typeof PROPERTY_OPERATOR) || 'Default'
    ] || PROPERTY_OPERATOR.Default;
  const placeholderInputProps = useManagePropertyRuleInputProps(
    selectedField,
    rule,
    operators,
  );

  const { remove } = useFieldArray({
    control,
    name: 'rules',
  });
  const groups = groupFieldsByType(fields || []);

  const handleRemove = () => remove(index);
  const handleUpdate = useCallback(
    (value: Partial<TManagePropertiesForm['rules'][number]>) => {
      setValue(
        `rules.${index}`,
        {
          ...rule,
          ...value,
        },
        {
          shouldDirty: true,
          shouldTouch: true,
        },
      );
    },
    [index, setValue, rule],
  );

  const hasInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedField && fields.length > 0 && operators.length > 0) {
      const hasField = rule?.field && rule?.field.trim() !== '';
      const initializationKey = `${propertyType}-${index}`;

      // Reset initialization flag when propertyType changes
      if (
        hasInitializedRef.current &&
        !hasInitializedRef.current.startsWith(propertyType)
      ) {
        hasInitializedRef.current = null;
      }

      // Only initialize if field is empty (new rule or after propertyType change)
      // When field is empty, reset everything - don't preserve old operator/value
      if (!hasField && hasInitializedRef.current !== initializationKey) {
        hasInitializedRef.current = initializationKey;
        setValue(
          `rules.${index}`,
          {
            field: fields[0].name,
            operator: operators[0]?.value || '',
            value: undefined,
            isExpression: false,
          },
          {
            shouldDirty: true,
            shouldTouch: true,
          },
        );
      }
    }
  }, [
    operators,
    index,
    selectedField,
    fields,
    propertyType,
    rule?.field,
    setValue,
  ]);

  return {
    control,
    rule,
    operators,
    operatorType,
    selectedField,
    placeholderInputProps,
    groups,
    handleRemove,
    handleUpdate,
  };
};

const useManagePropertyRuleInputProps = (
  selectedField?: IField,
  rule?: TManagePropertiesForm['rules'][number],
  operators: { value: string; label: string }[] = [],
) => {
  const enabled: any = selectedField ? { attribute: true } : undefined;
  const suggestionsOptions: any = {};
  let isDisabled = false;
  if (!selectedField || !operators.some((op) => op.value === rule?.operator)) {
    isDisabled = true;
  }

  if (selectedField?.selectOptions?.length) {
    enabled.option = true;
  }

  if (selectedField?.type === 'Date') {
    enabled.date = true;
  }

  if (selectedField?.type !== 'String') {
    suggestionsOptions.attribute = {
      attributeTypes: [selectedField?.type || ''],
    };
  }

  if (selectedField?.selectOptions?.length) {
    suggestionsOptions.option = {
      options: selectedField?.selectOptions?.map((option) => ({
        label: option.label,
        value: String(option.value),
      })),
    };
  }

  if (selectedField?.type === 'Boolean') {
    enabled.option = true;
    suggestionsOptions.option = {
      options: [
        {
          label: 'True',
          value: 'true',
        },
        {
          label: 'False',
          value: 'false',
        },
      ],
    };
  }
  return {
    isDisabled,
    enabled,
    suggestionsOptions,
  };
};
