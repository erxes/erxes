import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IField } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

interface IFormCommonFIelds {
  title?: string;
  description?: string;
  buttonText?: string;
  type?: string;
  numberOfPages?: number;
}
export interface IForm extends IFormCommonFIelds {
  _id: string;
  code?: string;
  createdUserId?: string;
  createdUser?: IUser;
  createdDate?: Date;
  fields?: IField[];
}

export interface IFormSubmission {
  formId: string;
  formSubmissions: string;
  contentTypeId: string;
}

export interface IFormData extends IFormCommonFIelds {
  fields?: IField[];
}

// mutation types
export type AddFormMutationVariables = {
  title?: string;
  description?: string;
  buttonText?: string;
  type: string;
  numberOfPages?: number;
};

export type AddFormMutationResponse = {
  addFormMutation: (params: {
    variables: AddFormMutationVariables;
  }) => Promise<any>;
};

export type BulkEditAndAddMutationVariables = {
  contentType: string;
  contentTypeId?: string;
  addingFields?: IField[];
  editingFields?: IField[];
};

export type FieldsBulkAddAndEditMutationResponse = {
  fieldsBulkAddAndEditMutation: (params: {
    variables: BulkEditAndAddMutationVariables;
  }) => Promise<void>;
};

export type EditFormMutationVariables = {
  _id: string;
  title?: string;
  description?: string;
  buttonText?: string;
  type: string;
  numberOfPages?: number;
};

export type EditFormMutationResponse = {
  editFormMutation: (params: {
    variables: EditFormMutationVariables;
  }) => Promise<any>;
};

export type FormDetailQueryResponse = {
  formDetail: IForm;
  loading: boolean;
  refetch: () => void;
};

export type RemoveFieldMutationVariables = {
  removeFieldsData: IField[];
};

export type RemoveFieldMutationResponse = {
  removeFieldMutation: (params: {
    variable: RemoveFieldMutationVariables;
  }) => Promise<void>;
};

export type FormsQueryResponse = {
  forms: IForm[];
  loading: boolean;
};

export interface IFormSubmissionParams {
  contentTypeId: string;
  contentType: string;
  formId: string;
  formField: JSON;
}

export type SaveFormSubmissionMutation = ({
  variables: IFormSubmissionParams
}) => Promise<any>;

export type ISubmission = {
  formFieldId: string;
  value: string;
  submittedAt?: Date;
};

export type IFormResponse = {
  contentTypeId: string;
  customerId: string;
  createdAt: Date;
  customer: ICustomer;
  submissions: ISubmission[];
};

export type FormSubmissionsQueryResponse = {
  formSubmissions: IFormResponse[];
  loading: boolean;
  refetch: () => void;
};

export type FormSubmissionsTotalCountQueryResponse = {
  formSubmissionsTotalCount: number;
};
