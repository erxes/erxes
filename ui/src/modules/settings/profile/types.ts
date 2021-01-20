import { IUserDoc } from '../../auth/types';

export type ChangePasswordMutationVariables = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordMutationResponse = {
  changePasswordMutation: (params: {
    variables: ChangePasswordMutationVariables;
  }) => Promise<any>;
};

export type EditProfileMutationResponse = {
  usersEditProfile: (params: { variables: IUserDoc }) => Promise<any>;
};
