export default [
  {
    type: 'voucher',
    handler: async ({ action, execution }, { models, sendRPCMessage }) => {
      let ownerType;
      let ownerId;

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

      const response = await sendRPCMessage('erxes-plugin-add-voucher', {
        compaignId: action.config.voucherCompaignId,
        ownerType,
        ownerId
      })

      return response
    }
  }
]