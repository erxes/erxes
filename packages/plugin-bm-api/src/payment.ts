import { generateModels } from "./connectionResolver";

export default {
  transactionCallback: async ({ subdomain, data }) => {
    // TODO: implement transaction callback if necessary
  },
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    console.log("bm works");

    const { status, contentType, contentTypeId, amount, _id, currency } = data;
    console.log("content", data);

    if (contentType !== "bm:order" || status !== "paid") {
      return;
    }
    const order = await models.Orders.findById(contentTypeId);

    await models.Orders.updateOne(
      { _id: contentTypeId },
      {
        $set: {
          status: "paid",
        },
      }
    );
  },
};
