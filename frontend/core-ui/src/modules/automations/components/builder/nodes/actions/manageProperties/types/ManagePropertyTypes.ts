import { IField as UIModuleField } from 'ui-modules';

export type OperatorType = 'String' | 'Date' | 'Number' | 'Default';

// Types
export interface IManagePropertyField extends Partial<UIModuleField> {
  group?: string;
  groupDetail?: {
    name: string;
  };
}

export interface IManageOperator {
  value: string;
  label: string;
  noInput?: boolean;
}

export interface IManagePropertyRule {
  field: string;
  operator: string;
  value?: any;
}

export interface IConfig {
  module?: string;
  rules: IManagePropertyRule[];
}

export type IManagePropertyFieldName = `actions.${number}.config`;

export interface RuleProps {
  rule: IManagePropertyRule;
  propertyType: string;
  selectedField?: IManagePropertyField;
  remove: () => void;
  handleChange: (name: string, value: any) => void;
  groups: Record<string, IManagePropertyField[]>;
  operatorOptions: IManageOperator[];
}
