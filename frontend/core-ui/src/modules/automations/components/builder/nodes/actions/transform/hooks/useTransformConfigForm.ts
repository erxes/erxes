import {
  transformConfigFormSchema,
  TTransformConfigForm,
} from '@/automations/components/builder/nodes/actions/transform/states/transformForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { TAutomationAction, useFormValidationErrorHandler } from 'ui-modules';

type TTransformMapping = TTransformConfigForm['mappings'][number];

const EMPTY_MAPPING: TTransformMapping = {
  key: '',
  value: '',
  type: 'text',
  isExpression: false,
};

const withMappingDefaults = (
  mapping: TTransformMapping,
): TTransformMapping => ({
  ...mapping,
  type: mapping.type || 'text',
  isExpression: mapping.isExpression || false,
});

const defaultValuesOf = (
  currentAction: TAutomationAction<TTransformConfigForm>,
): TTransformConfigForm => {
  const mappings = currentAction?.config?.mappings;

  return {
    mappings: mappings?.length
      ? mappings.map(withMappingDefaults)
      : [EMPTY_MAPPING],
  };
};

/** The transform's mappings: one empty row to start, never fewer than one. */
export const useTransformConfigForm = ({
  currentAction,
  handleSave,
}: {
  currentAction: TAutomationAction<TTransformConfigForm>;
  handleSave: SubmitHandler<TTransformConfigForm>;
}) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Transform Configuration',
  });
  const form = useForm<TTransformConfigForm>({
    resolver: zodResolver(transformConfigFormSchema),
    defaultValues: defaultValuesOf(currentAction),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'mappings',
  });

  const addMapping = useCallback(() => append(EMPTY_MAPPING), [append]);

  return {
    form,
    fields,
    canRemove: fields.length > 1,
    addMapping,
    remove,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};

/** One mapping row: open or folded, and its value read as text or an expression. */
export const useTransformConfigRow = (index: number) => {
  const [isOpen, setIsOpen] = useState(false);
  const { control, setValue } = useFormContext<TTransformConfigForm>();
  const isExpression = useWatch({
    control,
    name: `mappings.${index}.isExpression`,
  });

  const onChangeInputMode = useCallback(
    (mode: string) =>
      setValue(`mappings.${index}.isExpression`, mode === 'expression'),
    [setValue, index],
  );

  return { isOpen, setIsOpen, control, isExpression, onChangeInputMode };
};
