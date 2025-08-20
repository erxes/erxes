export interface IMenu {
  _id: string;
  parentId?: string;
  label: string;
  url: string;
  order: number;
  target: string;
  contentType?: string;
  contentTypeID?: string;
  kind?: string;
  icon?: string;
}

export type MenusQueryResponse = {
  cmsMenuList: IMenu[];
  loading: boolean;
  refetch: () => void;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type AddMutationResponse = {
  addMutation: (params: { variables: any }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: any }) => Promise<any>;
};
