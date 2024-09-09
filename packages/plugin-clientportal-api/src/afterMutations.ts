import { cardUpdateHandler, cardDeleteHandler } from "./afterMutations/cards";
import { kbHandler } from "./afterMutations/knowledgeBase";
import { IModels } from "./connectionResolver";

export default {
  "tickets:ticket": ["update", "delete"],
  "tasks:task": ["update", "delete"],
  "knowledgebase:knowledgeBaseArticle": ["create", "update"],
  "sales:deal": ["update", "delete"],
  "purchases:purchase": ["update", "delete"]
};

export const afterMutationHandlers = async (
  models: IModels,
  subdomain,
  params
) => {
  if (
    [
      "tasks:task",
      "tickets:ticket",
      "sales:deal",
      "purchases:purchase"
    ].includes(params.type) &&
    params.action === "update"
  ) {
    await cardUpdateHandler(models, subdomain, params);
  }

  if (
    [
      "tasks:task",
      "tickets:ticket",
      "sales:deal",
      "purchases:purchase"
    ].includes(params.type) &&
    params.action === "delete"
  ) {
    await cardDeleteHandler(models, subdomain, params);
  }

  if (params.type === "knowledgebase:knowledgeBaseArticle") {
    await kbHandler(models, subdomain, params);
  }

  return;
};
