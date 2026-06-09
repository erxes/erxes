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
  fieldLabel?: string;
  operator: string;
  value?: any;
  isExpression?: boolean;
};

export type TAutomationManagePropertyTarget = {
  label?: string;
  type?: string;
  source?: 'target' | 'relation' | 'resolver';
  cardinality?: 'one' | 'many';
  sourceType?: string;
  relation?: {
    contentType: string;
    relatedContentType: string;
  };
  resolverKey?: string;
  pluginName?: string;
  value?: string;
  description?: string;
};

export type TAutomationManagePropertyConfig = {
  module?: string;
  setPropertyTarget?: TAutomationManagePropertyTarget;
  rules: TAutomationManagePropertyRule[];
};
