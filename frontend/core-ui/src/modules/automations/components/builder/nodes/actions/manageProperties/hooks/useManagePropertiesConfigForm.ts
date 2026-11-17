import { useManagePropertySidebarContent } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertySidebarContent';
import {
  managePropertiesFormSchema,
  TManagePropertiesForm,
} from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  TAutomationAction,
  TAutomationActionProps,
  useFormValidationErrorHandler,
} from 'ui-modules';

const EMPTY_RULE = { field: '', operator: '' };

const defaultValuesOf = (currentAction: TAutomationAction) => {
  const values = { ...(currentAction?.config || {}) };

  if (!values.rules?.length) {
    values.rules = [EMPTY_RULE];
  }

  return values;
};

/**
 * The manage-properties form: the record type to change and its ordered
 * rules. Changing the type starts the rules over, since fields differ.
 */
export const useManagePropertiesConfigForm = ({
  currentAction,
  handleSave,
}: Pick<
  TAutomationActionProps<TManagePropertiesForm>,
  'currentAction' | 'handleSave'
>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Manage properties Configuration',
  });
  const form = useForm<TManagePropertiesForm>({
    resolver: zodResolver(managePropertiesFormSchema),
    defaultValues: defaultValuesOf(currentAction),
  });
  const sidebar = useManagePropertySidebarContent(currentAction, form);
  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: 'rules',
  });
  const { propertyTypes } = sidebar;

  const changeModule = useCallback(
    (onChange: (value: string) => void) => (value: string) => {
      onChange(value);
      form.setValue(
        'setPropertyTarget',
        propertyTypes.find((target) => target.value === value),
        { shouldDirty: true, shouldTouch: true },
      );
      replace([EMPTY_RULE]);
    },
    [form, propertyTypes, replace],
  );

  const addRule = useCallback(() => append(EMPTY_RULE), [append]);

  return {
    ...sidebar,
    form,
    fields,
    ruleIds: fields.map((field) => field.id),
    move,
    remove,
    addRule,
    changeModule,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};
