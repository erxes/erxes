import {
  ActivityLogs,
  Companies,
  Conversations,
  Customers,
  Deals
} from "../../../db/models";

export default {
  /**
   * Add conversation log
   */
  async activityLogsAddConversationLog(
    _root,
    {
      customerId,
      conversationId
    }: { customerId: string; conversationId: string }
  ) {
    const customer = await Customers.findOne({ _id: customerId });
    const conversation = await Conversations.findOne({ _id: conversationId });

    return ActivityLogs.createConversationLog(conversation, customer);
  },

  /**
   * Create customer registration log for the given customer
   */
  async activityLogsAddCustomerLog(_root, { _id }: { _id: string }) {
    const customer = await Customers.findOne({ _id });
    return ActivityLogs.createCustomerRegistrationLog(customer);
  },

  /**
   * Creates company registration log for the given company
   */
  async activityLogsAddCompanyLog(_root, { _id }: { _id: string }) {
    const company = await Companies.findOne({ _id });
    return ActivityLogs.createCompanyRegistrationLog(company);
  },

  /**
   * Creates deal registration log for the given deal
   */
  async activityLogsAddDealLog(_root, { _id }: { _id: string }) {
    const deal = await Deals.findOne({ _id });
    return ActivityLogs.createDealRegistrationLog(deal);
  }
};
