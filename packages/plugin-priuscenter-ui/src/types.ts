export interface IAd {
  _id: string;
  createdAt?: Date;
  type: string;

  title?: string;
  description?: string;
  mark?: string;
  model?: string;
  color?: string;
  manufacturedYear?: Number;
  state?: string;
  price?: number;
  attachments?: string[];
  location: Object;

  authorName?: string;
  authorPhone?: string;
  authorEmail?: string;
}

// queries
export type AdQueryResponse = {
  ads: IAd[];
  refetch: () => void;
  loading: boolean;
};

export type AdTotalCountQueryResponse = {
  adsTotalCount: number;
  refetch: () => void;
  loading: boolean;
};

// mutations
export type MutationVariables = {
  _id?: string;
  type?: string;
  name: string;
  createdAt?: Date;
};

export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};
