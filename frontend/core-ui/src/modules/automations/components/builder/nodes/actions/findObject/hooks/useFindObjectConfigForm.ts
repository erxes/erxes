import {
  findObjectConfigFormSchema,
  TAutomationFindObjectConfig,
} from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { TAutomationAction, useFormValidationErrorHandler } from 'ui-modules';

type TLookupField = { value: string; label: string };
type TFindObjectTarget = {
  value: string;
  label: string;
  lookupFields?: TLookupField[];
};

/**
 * Find a record: its type, the field it is looked up by (offered per type),
 * and the value, which can be typed only once both are chosen.
 */
export const useFindObjectConfigForm = ({
  currentAction,
  handleSave,
}: {
  currentAction: TAutomationAction<TAutomationFindObjectConfig>;
  handleSave: SubmitHandler<TAutomationFindObjectConfig>;
}) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Find object Configuration',
  });
  // The provider keeps the declared targets untyped
  const targets = useAutomation().findObjectTargetsConst as TFindObjectTarget[];
  const form = useForm<TAutomationFindObjectConfig>({
    resolver: zodResolver(findObjectConfigFormSchema),
    defaultValues: {
      objectType: currentAction?.config?.objectType || '',
      lookupField: currentAction?.config?.lookupField || '',
      value: currentAction?.config?.value || '',
    },
  });
  const [objectType, lookupField] = useWatch({
    control: form.control,
    name: ['objectType', 'lookupField'],
  });

  const lookupFields = useMemo<TLookupField[]>(
    () => targets.find(({ value }) => value === objectType)?.lookupFields || [],
    [targets, objectType],
  );

  return {
    form,
    targets,
    objectType,
    lookupFields,
    valueDisabled: !lookupField || !objectType,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};
