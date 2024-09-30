import {
  consumeQueue,
  consumeRPCQueue
} from "@erxes/api-utils/src/messageBroker";
import { generateModels } from "../connectionResolver";

export const setupInternalNotesMessageBroker = async (): Promise<void> => {
  consumeQueue(
    "core:batchUpdate",
    async ({
      subdomain,
      data: { contentType, oldContentTypeIds, newContentTypeId }
    }) => {
      const models = await generateModels(subdomain);
      // Updating every internal notes of company
      await models.InternalNotes.updateMany(
        {
          contentType,
          contentTypeId: { $in: oldContentTypeIds || [] }
        },
        { contentTypeId: newContentTypeId }
      );
    }
  );

  consumeQueue(
    "core:removeInternalNotes",
    async ({ subdomain, data: { contentType, contentTypeIds } }) => {
      const models = await generateModels(subdomain);
      models.InternalNotes.removeInternalNotes(contentType, contentTypeIds);
    }
  );

  consumeRPCQueue("core:findInternalNotes", async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    return {
      data: await models.InternalNotes.find(data).lean(),
      status: "success"
    };
  });
};
