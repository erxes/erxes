import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  ISupportAccessPolicyInput,
  ISupportGrantApproval,
  ISupportGrantDocument,
} from '@/auth/db/definitions/supportAccess';
import { SupportGrantListStatus } from '@/auth/db/models/SupportAccess';
import { validatePermissionGroupIds } from '@/organization/team-member/graphql/mutations';

// A support user is never an owner, so it cannot approve or extend its own access
const assertOwner = (user?: IUserDocument) => {
  if (!user?.isOwner) {
    throw new ExpectedError(
      'Only the owner manages support access',
      'FORBIDDEN',
    );
  }
};

export const supportAccessQueries = {
  async authSupportAccessPolicy(
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) {
    assertOwner(user);

    return models.SupportGrants.getPolicy();
  },

  async authSupportAccessGrants(
    _parent: undefined,
    { status }: { status?: SupportGrantListStatus },
    { models, user }: IContext,
  ) {
    assertOwner(user);

    return models.SupportGrants.listGrants(status);
  },

  // The banner: owners see every visit in progress, a support user its own
  async authSupportAccessActive(
    _parent: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) {
    return models.SupportGrants.activeFor(user);
  },
};

export const supportAccessMutations = {
  async authSupportAccessPolicySave(
    _parent: undefined,
    policy: ISupportAccessPolicyInput,
    { models, user }: IContext,
  ) {
    assertOwner(user);
    await validatePermissionGroupIds(models, policy.permissionGroupIds);

    return models.SupportGrants.savePolicy(policy);
  },

  async authSupportAccessApprove(
    _parent: undefined,
    { _id, ...approval }: { _id: string } & ISupportGrantApproval,
    { models, user }: IContext,
  ) {
    assertOwner(user);
    await validatePermissionGroupIds(models, approval.permissionGroupIds);

    return models.SupportGrants.approve(_id, approval, user._id);
  },

  async authSupportAccessDeny(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    assertOwner(user);

    return models.SupportGrants.deny(_id, user._id);
  },

  async authSupportAccessRevoke(
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    assertOwner(user);

    return models.SupportGrants.revoke(_id, user._id);
  },
};

export const supportAccessCustomResolvers = {
  AuthSupportGrant: {
    // An approved grant past endsAt has ended on its own
    status(grant: ISupportGrantDocument) {
      return grant.status === 'approved' &&
        grant.endsAt &&
        grant.endsAt <= new Date()
        ? 'expired'
        : grant.status;
    },
  },
};
