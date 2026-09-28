export type FormField = {
  _id: string;
  type: string | null;
  text: string | null;
  description: string | null;
  content: string | null;
  isRequired: boolean | null;
  options: string[] | null;
  validation: string | null;
  order: number | null;
  column: number | null;
  pageNumber: number | null;
};

export type FormSummary = {
  _id: string;
  title: string | null;
  name: string | null;
  description: string | null;
  tagIds: string[] | null;
};

export type FormLeadStep = {
  name?: string | null;
  description?: string | null;
  order?: number | null;
};

export type FormLeadData = {
  primaryColor?: string | null;
  thankTitle?: string | null;
  thankContent?: string | null;
  steps?: Record<string, FormLeadStep> | null;
};

export type PortalForm = FormSummary & {
  buttonText: string | null;
  channelId: string | null;
  status: string | null;
  leadData: FormLeadData | null;
  fields: FormField[] | null;
};

export type FormAttachment = {
  name: string;
  url: string;
  size: number;
  type: string;
};

export type FormSubmission = {
  _id: string;
  type: string | null;
  validation: string | null;
  text: string | null;
  value: string | FormAttachment[];
};

export type SaveLeadResponse = {
  cpWidgetsSaveLead: {
    status: string;
    errors: { fieldId: string | null; text: string | null }[] | null;
  } | null;
};

export const formTitle = (form: FormSummary): string =>
  form.title?.trim() || form.name?.trim() || 'Untitled form';
