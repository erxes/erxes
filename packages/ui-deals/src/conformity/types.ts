export interface IConformityDoc {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  relTypeId?: string;
}

export interface ISavedConformity {
  mainType?: string;
  mainTypeId?: string;
  isSaved?: boolean;
  isRelated?: boolean;
}

export type ConformityQueryResponse = {
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
  subscribeToMore: any;
};

export interface IConformityEdit {
  mainType?: string;
  mainTypeId?: string;
  relType?: string;
  relTypeIds?: string[];
}

export type EditConformityVariables = {
  _id?: string;
  mainType: string;
  mainTypeId: string;
  relType: string;
  relTypeIds: string[]
};

// mutation types
export type AddConformityMutation = ({ variables: IConformityDoc }) => void;

export type EditConformityMutation = ({
  variables,
  update,
  optimisticResponse
}: {
  variables: EditConformityVariables;
  update?: (store: any, data: any) => void;
  optimisticResponse?: any;
}) => Promise<any>;
