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

export interface IFormData {
  title?: string;
  description?: string;
  buttonText?: string;
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
  addFormMutation: (
    params: { variables: AddFormMutationVariables }
  ) => Promise<any>;
};

export type EditFormMutationVariables = {
  _id: string;
  title?: string;
  description?: string;
  buttonText?: string;
  type: string;
};

export type EditFormMutationResponse = {
  editFormMutation: (
    params: {
      variables: EditFormMutationVariables;
    }
  ) => Promise<any>;
};

export type AddFieldMutationVariables = {
  createFieldsData: IField[];
};

export type AddFieldMutationResponse = {
  addFieldMutation: (
    params: {
      variables: AddFieldMutationVariables;
    }
  ) => Promise<void>;
};

export type EditFieldMutationVariables = {
  updateFieldsData: IField[];
};

export type EditFieldMutationResponse = {
  editFieldMutation: (
    params: {
      variables: EditFieldMutationVariables;
    }
  ) => Promise<void>;
};

export type RemoveFieldMutationVariables = {
  removeFieldsData: IField[];
};

export type RemoveFieldMutationResponse = {
  removeFieldMutation: (
    params: { variable: RemoveFieldMutationVariables }
  ) => Promise<void>;
};

// query types
export interface IFormPreviewContent {
  formTitle: string;
  formBtnText: string;
  formDesc: string;
  fields?: IField[];
  onFieldEdit?: (field: IField, props) => void;
  onFieldChange?: (name: any, value: IField[]) => void;
}

export type FormDetailQueryResponse = {
  formDetail: IForm;
  loading: boolean;
  refetch: () => void;
};

export type FormsQueryResponse = {
  forms: IForm[];
  loading: boolean;
};
