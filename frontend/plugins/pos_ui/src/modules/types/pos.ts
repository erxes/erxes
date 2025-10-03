export interface IUser {
  _id: string;
  details: {
    avatar: string;
    fullName: string;
    __typename: string;
  };
  __typename: string;
}

export interface IPos {
  _id: string;
  name: string;
  isOnline: boolean;
  onServer: boolean;
  branchTitle: string;
  departmentTitle: string;
  createdAt: string;
  createdBy: string;
  user: IUser;
}
