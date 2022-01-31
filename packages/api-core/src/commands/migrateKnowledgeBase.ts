import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles
} from '../db/models';

dotenv.config();

const setTopicId = async () => {
  const topics = await KnowledgeBaseTopics.find({});

  console.log('topic counts: ', topics.length);

  for (const topic of topics) {
    if (topic.categoryIds) {
      await KnowledgeBaseCategories.updateMany(
        { _id: { $in: topic.categoryIds } },
        { $set: { topicId: topic._id } }
      );
    }
  }
};

const setCategoryId = async () => {
  const categories = await KnowledgeBaseCategories.find({});

  console.log('category counts: ', categories.length);

  for (const category of categories) {
    if (category.articleIds) {
      await KnowledgeBaseArticles.updateMany(
        { _id: { $in: category.articleIds } },
        { $set: { categoryId: category._id, topicId: category.topicId } }
      );
    }
  }
};

const command = async () => {
  await connect();

  await setTopicId();
  await setCategoryId();

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
