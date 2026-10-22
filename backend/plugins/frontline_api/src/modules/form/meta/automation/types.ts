export type TFormSubmittedTriggerTarget = {
  // groupId shared by the submission rows of one submit
  _id: string;
  formId: string;
  channelId?: string;
  customerId: string;
  conversationId: string | null;
  fieldValues: Record<string, unknown>;
};

export type TFormFieldCondition = {
  fieldId: string;
  operator: string;
  value?: string;
};

export type TFormSubmittedTriggerConfig = {
  channelId?: string;
  formId?: string;
  conjunction?: 'and' | 'or';
  conditions?: TFormFieldCondition[];
};
