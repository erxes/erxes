export interface IBranchUser {
  _id: string;
  email: string;
  username: string;
  details: {
    avatar: string;
    fullName: string;
    shortName: string;
  };
}

export interface IBranch {
  _id: string;
  createdAt: string;
  userId: string;
  user: IBranchUser;
  name: string;
  description: string;
  generalManagerIds: string[];
  managerIds: string[];
  paymentIds: string[];
  paymentTypes: string[];
  departmentId: string;
  token: string;
  erxesAppToken: string;
  permissionConfig: any;
  uiOptions: any;
  managers: IBranchUser[];
  generalManagers: IBranchUser[];
}

export interface IBranchRemoveVariables {
  id: string;
}

export interface IBranchRemoveResponse {
  bmsBranchRemove: boolean;
}
