import { Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

export let Users;
export let Conversations;
export let Channels;
export let Integrations;
export let Customers;
export let ConversationMessages;
export let Fields;
export let Segments;
export let Conformities;
export let Tags;
export let Pipelines;
export let Forms;
export let Boards;
export let Brands;
export let Companies;
export let PipelineLabels;
export let Stages;
export let Deals;
export let Tasks;
export let Tickets;
export let GrowthHacks;
export let Products;
export let KnowledgeBaseCategories;
export let KnowledgeBaseArticles;
export let ProductCategories;
export let KnowledgeBaseTopics;
export let UsersGroups;
export let Checklists;

export async function connect() {
  await client.connect();
  console.log(`DB: Connected to ${MONGO_URL}`);
  db = client.db();
  Users = db.collection('users');
  Conversations = db.collection('conversations');
  Channels = db.collection('channels');
  Integrations = db.collection('integrations');
  Customers = db.collection('customers');
  ConversationMessages = db.collection('conversation_messages');
  Fields = db.collection('fields');
  Segments = db.collection('segments');
  Conformities = db.collection('conformities');
  Tags = db.collection('tags');
  Pipelines = db.collection('pipelines');
  Forms = db.collection('forms');
  Boards = db.collection('boards');
  Brands = db.collection('brands');
  Companies = db.collection('companies');
  PipelineLabels = db.collection('pipeline_labels');
  Stages = db.collection('stages');
  Deals = db.collection('deals');
  Tasks = db.collection('tasks');
  Tickets = db.collection('tickets');
  GrowthHacks = db.collection('growth_hacks');
  Products = db.collection('products');
  KnowledgeBaseCategories = db.collection('knowledge_base_categories');
  KnowledgeBaseArticles = db.collection('knowledge_base_articles');
  ProductCategories = db.collection('product_categories');
  KnowledgeBaseTopics = db.collection('knowledge_base_topics');
  UsersGroups = db.collection('users_groups');
  Checklists = db.collection('checklists');
}

export async function disconnect() {
  try {
    await client.close();
    console.log(`DB: Connection closed ${MONGO_URL}`);
  } catch (e) {
    console.error(e);
  }
}
