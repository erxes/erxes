import { IField as UIModuleField } from 'ui-modules';

export type OperatorType = 'String' | 'Date' | 'Number' | 'Default';

// Types
export interface IManagePropertyField extends Partial<UIModuleField> {
  group?: string;
  groupDetail?: {
    name: string;
  };
}

export type TAutomationManagePropertyOperator = {
  value: string;
  label: string;
  noInput?: boolean;
};

export type TAutomationManagePropertyRule = {
  field: string;
  operator: string;
  value?: any;
};

export type TAutomationManagePropertyConfig = {
  module?: string;
  rules: TAutomationManagePropertyRule[];
};
