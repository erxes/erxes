import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';
import { IField } from '@erxes/ui/src/types';

export type FieldsQueryResponse = {
  fields: IField[];
  loading: boolean;
  refetch: () => Promise<void>;
};

export type FieldsCombinedByType = {
  _id: string;
  name: string;
  label: string;
  brandName?: string;
  brandId?: string;
  type: string;
  selectOptions?: any[];
  order?: number;
  group?: string;
  options?: string[];
  title?: string;
};

export type FieldsCombinedByTypeQueryResponse = {
  fieldsCombinedByContentType: FieldsCombinedByType[];
} & QueryResponse;

export interface IBoardSelectItem {
  _id?: string;
  boardId: string;
  pipelineIds: string[];
}

export interface IFieldGroup {
  _id: string;
  name: string;
  contentType: string;
  order: React.ReactNode;
  description: string;
  isVisible: boolean;
  isVisibleInDetail: boolean;
  isDefinedByErxes: boolean;
  fields: IField[];
  lastUpdatedUserId: string;
  lastUpdatedUser: IUser;
  boardsPipelines?: IBoardSelectItem[];
}

// mutation types
export type FieldsMutationVariables = {
  type: string;
  validation: string;
  text: string;
  description: string;
  options: any[];
  groupId: string;
};

export type FieldsAddMutationResponse = {
  fieldsAdd: (fieldsAdd: {
    variables: FieldsMutationVariables;
  }) => Promise<any>;
};

export type FieldsEditMutationResponse = {
  fieldsEdit: (fieldsEdit: {
    variables: FieldsMutationVariables;
  }) => Promise<any>;
};

export type FieldsGroupsQueryResponse = {
  fieldsGroups: IFieldGroup[];
  loading: boolean;
  refetch: ({ contentType }: { contentType?: string }) => Promise<any>;
};

export type AddFieldsMutationVariables = {
  contentType: string;
  contentTypeId: string;
  field: IField;
};

export type AddFieldsMutationResponse = {
  addFieldsMutation: (params: {
    variables: AddFieldsMutationVariables;
  }) => void;
};
