import { generateModels } from "./connectionResolver";
import * as moment from "moment";

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    if (data.contentType === "loans:contracts") {
      const contract = await models.Contracts.findOne({
        _id: data.contentTypeId,
      });
      if (contract) {
        await models.Transactions.createTransaction(subdomain, {
          currency: contract.currency,
          payDate: data.resolvedAt || new Date(),
          total: data.amount,
          contractId: contract._id,
          customerId: contract?.customerId,
          description: `Харилцагчид ${data.paymentKind} гэрээний хувьд төлбөр хүлээгдэх. ${moment(data.resolvedAt).format("YYYY-MM-DD HH:mm:ss")}-д`,
        });
      }
    }
  },
};
