import { IContext } from '~/connectionResolvers';
import { OWNER_TYPES } from '~/constants';
import { IVoucherDocument } from '~/modules/voucher/@types/voucher';

export default {
  async __resolveReference(
    { _id }: IVoucherDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.Voucher.findOne({ _id }).lean();
  },

  async owner({ ownerId, ownerType }: IVoucherDocument) {
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

  async campaign({ campaignId }: IVoucherDocument) {
    return { __typename: 'VoucherCampaign', _id: campaignId };
  },

  async createdBy({ createdBy }: IVoucherDocument) {
    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: IVoucherDocument) {
    return { __typename: 'User', _id: updatedBy };
  },
};
