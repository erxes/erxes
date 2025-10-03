import { PROPERTY_OPERATOR } from '@/automations/constants';
import {
  IManagePropertyField,
  IManagePropertyFieldName,
  IManagePropertyRule,
  OperatorType,
} from '../types/ManagePropertyTypes';
import { UseFormSetValue } from 'react-hook-form';
import { TAutomationBuilderForm } from '@/automations/utils/AutomationFormDefinitions';

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const useManagePropertyRule = (
  rules: IManagePropertyRule[],
  index: number,
  fieldName: IManagePropertyFieldName,
  setValue: UseFormSetValue<TAutomationBuilderForm>,
  fields: IManagePropertyField[],
  rule: IManagePropertyRule,
) => {
  const handleChange = (name: string, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [name]: value };
    setValue(`${fieldName}.rules` as any, updatedRules);
  };

  const selectedField = fields.find((field) => field.name === rule.field);

  const handleRemove = () => {
    setValue(
      `${fieldName}.rules` as any,
      rules.filter((_, ruleIndex) => index !== ruleIndex),
    );
  };

  const operatorType = selectedField?.name?.includes('customFieldsData')
    ? capitalizeFirstLetter(selectedField?.validation || 'String')
    : selectedField?.type || '';

  const operators =
    PROPERTY_OPERATOR[operatorType as OperatorType] ||
    PROPERTY_OPERATOR.Default;

  return {
    handleRemove,
    operators,
    handleChange,
    selectedField,
  };
};
