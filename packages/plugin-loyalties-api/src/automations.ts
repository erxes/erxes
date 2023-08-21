import { generateModels, IModels } from './connectionResolver';
import { sendContactsMessage, sendCoreMessage } from './messageBroker';

export default {
  constants: {
    actions: [
      {
        type: 'loyalties:voucher.create',
        icon: 'file-plus',
        label: 'Create voucher',
        description: 'Create voucher',
        isAvailable: true
      },
      {
        type: 'loyalties:scoreLog.create',
        icon: 'file-plus',
        label: 'Change Score',
        description: 'Change Score',
        isAvailable: true
      }
    ]
  },
  receiveActions: async ({
    subdomain,
    data: { action, execution, actionType }
  }) => {
    const models = await generateModels(subdomain);
    if (actionType === 'create') {
      return actionCreate({ models, subdomain, action, execution });
    }

    return;
  }
};

const actionCreate = async ({ models, subdomain, action, execution }) => {
  const { config = {} } = action;
  let ownerType;
  let ownerId;

  const [_service, type] = execution.triggerType.split(':');
  try {
    if (
      ['contacts:customer', 'core:user', 'contacts:company'].includes(
        execution.triggerType
      )
    ) {
      ownerType = type;
      ownerId = execution.targetId;
    }

    if (execution.triggerType === 'inbox:conversation') {
      ownerType = 'customer';
      ownerId = execution.target.customerId;
    }

    if (
      ['cards:task', 'cards:deal', 'cards:ticket', 'cards:purchase'].includes(
        execution.triggerType
      )
    ) {
      const customerIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: type,
          mainTypeId: execution.targetId,
          relTypes: ['customer']
        },
        isRPC: true,
        defaultValue: []
      });

      if (customerIds.length) {
        const customers = await sendContactsMessage({
          subdomain,
          action: 'customers.find',
          data: {
            _id: { $in: customerIds }
          },
          isRPC: true,
          defaultValue: []
        });

        if (customers.length) {
          ownerType = 'customer';
          ownerId = customers[0]._id;
        }
      }
    }

    if (execution.triggerType === 'pos:posOrder') {
      ownerType = 'customer';
      ownerId = execution.target.customerId;
    }

    if (!ownerType || !ownerId) {
      return { error: 'not found voucher owner' };
    }

    if (action.type === 'loyalties:scoreLog.create') {
      const scoreLog = await models.ScoreLogs.changeScore({
        ownerType,
        ownerId,
        changeScore: config.changeScore,
        description: 'from automation'
      });

      return scoreLog;
    }

    if (action.type === 'loyalties:voucher.create') {
      const voucher = await models.Vouchers.createVoucher({
        campaignId: config.voucherCampaignId,
        ownerType,
        ownerId
      });

      return voucher;
    }

    return {};
  } catch (e) {
    return { error: e.message };
  }
};
