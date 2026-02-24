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
}

export interface IRule {
  fieldId: string;
  operator: string;
  value: string;
}

export interface LeadData {
  adminEmails: string[];
  thankImage?: string;
  thankTitle: string;
  thankContent: string;
  viewCount: number;
  contactsGathered: number;
  appearance: string;
  primaryColor: string;
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
