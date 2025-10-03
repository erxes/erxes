export interface IBranchUser {
  _id: string;
  details: {
    avatar: string;
    fullName: string;
    __typename: string;
  };
  __typename: string;
}

export interface IBranch {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  token: string;
  erxesAppToken: string;
  user1Ids: string[];
  user2Ids: string[];
  paymentIds: string[];
  paymentTypes: string[];
  user: IBranchUser;
  uiOptions: any;
  permissionConfig: any;
  __typename: string;
}

export interface IBranchRemoveVariables {
  id: string;
}

export interface IBranchRemoveResponse {
  bmsBranchRemove: boolean;
}
