import { generateModels, IModels } from "./connectionResolver";

export default {
  receiveActions: async ({
    subdomain,
    data: { action, execution },
  }) => {
    const models = await generateModels(subdomain);
    return actionCreate({ models, action, execution });

  },
};

const actionCreate = async ({ models, action, execution }) => {
  const { config = {} } = action;
  let ownerType;
  let ownerId;

  try {
    if (['customer', 'user', 'company'].includes(execution.triggerType)) {
      ownerType = execution.triggerType
      ownerId = execution.targetId
    }

    if (execution.triggerType === 'conversation') {
      ownerType = 'customer'
      ownerId = execution.target.customerId
    }

    if (!ownerType || !ownerId) {
      return { error: 'not found voucher owner' }
    }

    const voucher = await models.Vouchers.createVoucher({
      campaignId: action.config.voucherCompaignId,
      ownerType,
      ownerId
    })

    return voucher;
  } catch (e) {
    return { error: e.message };
  }
};