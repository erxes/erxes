export type FieldValidatorType = 'PRESET' | 'CUSTOM' | 'NONE';
export type FieldValidatorPresetKey =
  | 'EMAIL'
  | 'PHONE_INTL'
  | 'POSTAL_CODE'
  | 'ALPHANUMERIC';

export interface IFieldValidator {
  type: FieldValidatorType;
  presetKey?: FieldValidatorPresetKey;
  customRegex?: string;
  errorMessage?: string;
}

export interface IFormStep {
  name: string;
  description: string;
  order: number;
}

export interface IFormField {
  _id: string;
  code: string | null;
  column: number;
  content: string;
  contentType: string;
  contentTypeId: string;
  description: string;
  field: string | null;
  isDisabled: boolean | null;
  isRequired: boolean;
  isVisible: boolean;
  name: string | null;
  options: string[];
  objectListConfigs: any[];
  order: number;
  pageNumber: number;
  text: string;
  type: string;
  logics?: IFormFieldLogic[];
  logicAction?: string;
  allowSearch?: boolean;
  validator?: IFieldValidator;
}

export interface IFormFieldLogic {
  fieldId: string;
  logicOperator?: string;
  logicValue?: any;
}

export interface IRule {
  fieldId: string;
  operator: string;
  value: string;
}

export interface LeadData {
  adminEmails: string[];
  successImage?: string;
  thankTitle: string;
  thankContent: string;
  viewCount: number;
  contactsGathered: number;
  appearance: string;
  primaryColor: string;
  loadType?: string;
  steps: Record<string, { name: string; description: string; order: number }>;
  rules: IRule[];
}

export interface IFormData {
  _id: string;
  name: string;
  title: string;
  code: string;
  type: string;
  description: string;
  buttonText: string;
  createdDate: string;
  numberOfPages: number;
  status: string;
  googleMapApiKey: string | null;
  fields: IFormField[];
  visibility: string | null;
  leadData: LeadData;
  languageCode: string | null;
  departmentIds: string[];
  tagIds: string[];
  channelId: string;
  integrationId: string | null;
}

export type IAttachment = {
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
};