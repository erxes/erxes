import { sendSalesMessage } from "./messageBroker";

export default {
  "sales:deal": ["update"],
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === "sales:deal") {
    if (action === "update") {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || "";

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      const stage = await sendSalesMessage({
        subdomain,
        action: "stages.findOne",
        data: { _id: destinationStageId },
        isRPC: true,
        defaultValue: {},
      });
      console.log("stage", stage);

      return;
    }
  }
};
