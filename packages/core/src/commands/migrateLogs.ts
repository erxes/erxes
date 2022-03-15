import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Logs: Collection<any>;

const changeType = type => {
  let prefix = '';

  switch (type) {
    case "board":
    case "task":
    case "taskBoards": 
    case "taskPipelines": 
    case "ticket": 
    case "ticketBoards": 
    case "ticketPipelines": 
    case "ticketStages": 
    case "deal":
	  case "dealBoards":
	  case "dealPipelines":
    case "checkListItem":
    case "checklist":
    case "dealStages":
    case "growthHack":
	  case "growthHackBoards":
	  case "growthHackPipelines":
    case 	"pipelineLabel":
    case "pipelineTemplate":
      prefix = 'cards';
      break;

    case "product":
    case "productCategory":
      prefix = 'products';
      break;

    case "knowledgeBaseArticle":
    case "knowledgeBaseCategory":
    case "knowledgeBaseTopic":
      prefix = 'knowledgebase';
      break;

    case "internalNote":
      prefix = 'internalnotes';
      break;

    case "tag":
      prefix = 'tags';
      break;

    case "customer":
    case "company":
      prefix = "contacts"
      break;

    case "channel":
    case "conversation":
    case "integration":
      prefix = 'inbox';
      break;

    case "segment":
      prefix = 'segments';
      break;
    case "permission":
    case "user":
    case "brand":
      prefix = 'core';
      break;
    case "engage":
      prefix = 'engages';
      break;
    default:
      break;
  }

  return `${prefix}:${type}`;
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Logs = db.collection('logs');

  await Logs.find({}).forEach(doc => {
    const type = changeType(doc.type);

    Logs.updateOne({ _id: doc._id }, { $set: { type } });
  });

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
