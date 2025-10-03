import { sendTRPCMessage } from "erxes-api-shared/utils";

const resolver = {
  customerDetail: async ({ _id, customerType }) => {
    if (customerType === "user") {
      return await sendTRPCMessage({
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id }
      });
    }

    if (customerType === "company") {
      return await sendTRPCMessage({
        pluginName: 'core',
        module: 'company',
        action: 'findOne',
        input: { _id }
      })
    }

    if (!!_id && !customerType) {
      return await sendTRPCMessage({
        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: { _id }
      })
    }
    return null;
  }
};

export default resolver;
