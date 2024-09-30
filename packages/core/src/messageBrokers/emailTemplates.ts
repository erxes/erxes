import { consumeRPCQueue } from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "../connectionResolver";

export const setupMessageEmailTemplatesConsumers = async (): Promise<void> => {
  consumeRPCQueue("emailtemplatesFind", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.EmailTemplates.find(data).lean()
    };
  });

  consumeRPCQueue("emailTemplatesFindOne", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      status: "success",
      data: await models.EmailTemplates.findOne(data)
    };
  });
};
