import { articleSchema } from "./models/definitions/knowledgebase";
import { categorySchema } from "./models/definitions/knowledgebase";
import { topicSchema } from "./models/definitions/knowledgebase";

export const MODULE_NAMES = {
  KB_TOPIC: 'knowledgeBaseTopic',
  KB_CATEGORY: 'knowledgeBaseCategory',
  KB_ARTICLE: 'knowledgeBaseArticle',
};

export const LOG_MAPPINGS = [
  {
    name: 'knowledgeBaseTopic',
    schemas: [topicSchema]
  },
  {
    name: 'knowledgeBaseCategory',
    schemas: [categorySchema]
  },
  {
    name: 'knowledgeBaseArticle',
    schemas: [articleSchema]
  },
];
