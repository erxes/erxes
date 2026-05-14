import { IManagePropertyFieldName } from '@/automations/components/builder/nodes/actions/manageProperties/types/ManagePropertyTypes';
import { IField as UIModuleField } from 'ui-modules';

/**
 * Extended field interface for manage properties functionality
 */
export interface ManagePropertyField extends Partial<UIModuleField> {
  group?: string;
  groupDetail?: {
    name: string;
  };
}

/**
 * Operator configuration for property management rules
 */
export interface ManagePropertyOperator {
  value: string;
  label: string;
  noInput?: boolean;
}

/**
 * Rule definition for property management
 */
export interface ManagePropertyRule {
  field: string;
  operator: string;
  value?: any;
}

/**
 * Configuration for manage properties action
 */
export interface ManagePropertyConfig {
  module?: string;
  rules: ManagePropertyRule[];
}

/**
 * Props for the Rule component in manage properties
 */
export interface ManagePropertyRuleProps {
  rules: ManagePropertyRule[];
  rule: ManagePropertyRule;
  propertyType: string;
  selectedField?: ManagePropertyField;
  fieldName: IManagePropertyFieldName;
  index: number;
}
