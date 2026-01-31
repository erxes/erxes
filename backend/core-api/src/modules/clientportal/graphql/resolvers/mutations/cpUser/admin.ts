import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  getCPUserByIdOrThrow,
  validatePassword,
} from '@/clientportal/services';
import type {
  CpUsersAddParams,
  CpUsersEditParams,
  CpUsersSetPasswordParams,
} from '@/clientportal/types/cpUserParams';

export const adminMutations: Record<string, Resolver> = {
  async cpUsersAdd(
    _root: unknown,
    params: CpUsersAddParams,
    { models }: IContext,
  ) {
    return models.CPUser.createUserAsAdmin(
      params.clientPortalId,
      {
        email: params.email,
        phone: params.phone,
        username: params.username,
        password: params.password,
        firstName: params.firstName,
        lastName: params.lastName,
        type: params.userType as 'customer' | 'company' | undefined,
      },
      models,
    );
  },

  async cpUsersEdit(
    _root: unknown,
    { _id, ...params }: CpUsersEditParams,
    { models }: IContext,
  ) {
    return models.CPUser.updateUser(_id, params, models);
  },

  async cpUsersRemove(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    await models.CPUser.removeUser(_id, models);
    return { _id };
  },

  async cpUsersSetPassword(
    _root: unknown,
    { _id, newPassword }: CpUsersSetPasswordParams,
    { models }: IContext,
  ) {
    await getCPUserByIdOrThrow(_id, models);

    validatePassword(newPassword);
    const hashedPassword = await models.CPUser.generatePassword(newPassword);
    await models.CPUser.updateOne(
      { _id },
      {
        $set: { password: hashedPassword },
        $unset: { actionCode: '' },
      },
    );
    return getCPUserByIdOrThrow(_id, models);
  },
};

checkPermission(adminMutations, 'cpUsersAdd', 'manageClientPortalUsers');
checkPermission(adminMutations, 'cpUsersEdit', 'manageClientPortalUsers');
checkPermission(adminMutations, 'cpUsersRemove', 'manageClientPortalUsers');
checkPermission(
  adminMutations,
  'cpUsersSetPassword',
  'manageClientPortalUsers',
);
