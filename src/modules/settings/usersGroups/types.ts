export interface IUserGroup {
  name?: string;
  description?: string;
}

export interface IUserGroupDocument extends IUserGroup {
  _id: string;
}

export type UsersGroupsQueryResponse = {
  usersGroups: IUserGroup[];
  loading: boolean;
};

export type UsersGroupsTotalCountQueryResponse = {
  usersGroupsTotalCount: number;
  loading: boolean;
};

export type UsersGroupsAddMutation = {
  usersGroupsAdd: (params: { variables: IUserGroup }) => Promise<any>;
  loading: boolean;
};

export type UsersGroupsEditMutation = {
  usersGroupsEdit: (
    params: { variables: { _id: string } & IUserGroup }
  ) => Promise<any>;
};

export type UsersGroupsRemoveMutation = {
  usersGroupsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};
