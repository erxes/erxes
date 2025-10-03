import { getContentType } from '@/automations/utils/automationBuilderUtils';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';
import { useFormContext, useWatch } from 'react-hook-form';
import { getFieldsProperties, groupFieldsByType, IAction } from 'ui-modules';
import {
  IConfig,
  IManagePropertyFieldName,
} from '../types/ManagePropertyTypes';

export const useManagePropertySidebarContent = (
  currentActionIndex: number,
  currentAction: IAction,
) => {
  const fieldName: IManagePropertyFieldName = `actions.${currentActionIndex}.config`;
  const { setValue, control } = useFormContext<TAutomationBuilderForm>();
  const [actions = [], triggers = [], config = {}] =
    useWatch<TAutomationBuilderForm>({
      control,
      name: ['triggers', 'actions', `${fieldName}`],
    });
  const { module, rules = [{ field: '', operator: '' }] } = (config ||
    {}) as IConfig;

  const propertyType =
    module || getContentType(currentAction.id, actions, triggers)?.type || '';

  const {
    propertyTypes,
    fields = [],
    loading,
  } = getFieldsProperties(propertyType);
  const groups = groupFieldsByType(fields || []);

  const addRule = () => {
    setValue(fieldName, {
      ...config,
      rules: [...(rules || []), { field: '', operator: '' }],
    });
  };

  return {
    addRule,
    groups,
    propertyTypes,
    loading,
    setValue,
    control,
    propertyType,
    fieldName,
    rules,
    fields,
    module,
  };
};
