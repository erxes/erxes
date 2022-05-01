import { sendCommonMessage, sendCoreMessage } from "../../messageBroker";

const mutations = {
  /**
   * Create new message
   */
  async modifyWaiterCustomerList(_root, { dealId, customerId, type }) {
    let customerIds = await sendCoreMessage({
      subdomain: "os",
      data: {
        mainType: "deal",
        mainTypeIds: [dealId],
        relType: "waiterCustomer",
      },
      action: "conformities.filterConformity",
      isRPC: true,
      defaultValue: [],
    });

    if (type === "add" && !customerIds.includes(customerId)) {
      customerIds.push(customerId);
    } else if (type === "remove") {
      customerIds = customerIds.filter(id => id !== customerId);
    }

    await sendCoreMessage({
      subdomain: "os",
      data: {
        mainType: "deal",
        mainTypeId: dealId,
        relType: "waiterCustomer",
        relTypeIds: customerIds,
      },
      action: "conformities.editConformity",
      isRPC: true,
      defaultValue: [],
    });

    return customerIds;
  },

  async updateRentpayCustomer(_root, { customerId, customerFields }) {
    const updated = await sendCommonMessage({
      subdomain: "os",
      data: {
        _id: customerId,
        doc: {
          customerFields,
        },
      },
      serviceName: "contacts",
      action: "customers.updateCustomer",
      isRPC: true,
    });

    return updated;
  },
};

export default mutations;
