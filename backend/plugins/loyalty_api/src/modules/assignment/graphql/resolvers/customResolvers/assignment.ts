import { IAssignmentDocument } from '@/assignment/@types/assignment';
import { IContext } from '~/connectionResolvers';
import { OWNER_TYPES } from '~/constants';

export const Assignment = {
  async __resolveReference(
    { _id }: IAssignmentDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.Assignment.findOne({ _id }).lean();
  },

  async owner({ ownerId, ownerType }: IAssignmentDocument) {
    if (!ownerId || !ownerType) return null;

    if (ownerType === OWNER_TYPES.CUSTOMER) {
      return { __typename: 'Customer', _id: ownerId };
    }

    if (ownerType === OWNER_TYPES.MEMBER) {
      return { __typename: 'User', _id: ownerId };
    }

    if (ownerType === OWNER_TYPES.COMPANY) {
      return { __typename: 'Company', _id: ownerId };
    }

    if (ownerType === OWNER_TYPES.CPUSER) {
      return { __typename: 'ClientPortalUser', _id: ownerId };
    }

    return null;
  },

  async createdBy({ createdBy }: IAssignmentDocument) {
    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: IAssignmentDocument) {
    return { __typename: 'User', _id: updatedBy };
  },
};
