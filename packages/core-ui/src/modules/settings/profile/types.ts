import { IUser } from '@erxes/ui/src/auth/types';
import { IUserDoc } from '../../auth/types';

export type ChangePasswordMutationVariables = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordMutationResponse = {
  changePasswordMutation: (params: {
    variables: ChangePasswordMutationVariables;
  }) => Promise<IUser>;
};

export type EditProfileMutationResponse = {
  usersEditProfile: (params: { variables: IUserDoc }) => Promise<IUser>;
};
