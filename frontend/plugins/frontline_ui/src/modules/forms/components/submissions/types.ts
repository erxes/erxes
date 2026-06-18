export interface ISubmissionItem {
  _id: string;
  customerId: string;
  formId: string;
  formFieldId: string;
  text: string;
  formFieldText: string;
  formFieldType: string;
  value: JSON;
  submittedAt: string;
}

export interface IFormSubmission {
  _id: string;
  customerId: string;
  createdAt: string;
  submissions: ISubmissionItem[];
  formId: string;
  channelId: string;
  contentTypeId?: string;
}
