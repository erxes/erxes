import { sendTRPCMessage } from "erxes-api-shared/utils";

const resolver = {
  customer: async ({ customerId, customerType }) => {
    if (customerType === "user") {
      return await sendTRPCMessage({
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id: customerId }
      });
    }

    if (customerType === "company") {
      return await sendTRPCMessage({
        pluginName: 'core',
        module: 'company',
        action: 'findOne',
        input: { _id: customerId }
      })
    }

    if (!!customerId && !customerType) {
      return await sendTRPCMessage({
        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: { _id: customerId }
      })
    }
    return null;
  }
};

export default resolver;
