import { IUser } from '../auth/types';
import { IField } from '../settings/properties/types';

export interface IForm {
  _id: string;
  title?: string;
  code?: string;
  type?: string;
  description?: string;
  buttonText?: string;
  createdUserId?: string;
  createdUser?: IUser;
  createdDate?: Date;
}

export interface IFormSubmission {
  formId: string;
  formSubmissions: string;
  contentTypeId: string;
}

export interface IFormData {
  title?: string;
  desc?: string;
  btnText?: string;
  fields?: IField[];
  type?: string;
}

// mutation types
export type AddFormMutationVariables = {
  title?: string;
  description?: string;
  buttonText?: string;
  type: string;
};

export type AddFormMutationResponse = {
  addFormMutation: (params: {
    variables: AddFormMutationVariables;
  }) => Promise<any>;
};

export type EditFormMutationVariables = {
  _id: string;
  title?: string;
  description?: string;
  buttonText?: string;
  type: string;
};

export type EditFormMutationResponse = {
  editFormMutation: (params: {
    variables: EditFormMutationVariables;
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

export type RemoveFieldMutationVariables = {
  removeFieldsData: IField[];
};

export type RemoveFieldMutationResponse = {
  removeFieldMutation: (params: {
    variable: RemoveFieldMutationVariables;
  }) => Promise<void>;
};

export type FormDetailQueryResponse = {
  formDetail: IForm;
  loading: boolean;
  refetch: () => void;
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
