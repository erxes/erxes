import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const MONGO_URL = 'mongodb://localhost:27017/erxes';

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Stages: Collection<any>;
let Deal_Stages: Collection<any>;
let Task_Stages: Collection<any>;
let Ticket_Stages: Collection<any>;
let Purchase_Stages: Collection<any>;
let GH_Stages: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Stages = db.collection('stages');
  Deal_Stages = db.collection('deal_stages');
  Task_Stages = db.collection('task_stages');
  Ticket_Stages = db.collection('ticket_stages');
  Purchase_Stages = db.collection('purchase_stages');
  GH_Stages = db.collection('growthhack_stages');

  const dealStages = await Stages.find({ type: 'deal' }).toArray();
  const taskStages = await Stages.find({ type: 'task' }).toArray();
  const ticketStages = await Stages.find({ type: 'ticket' }).toArray();
  const purchaseStages = await Stages.find({ type: 'purchase' }).toArray();
  const ghStages = await Stages.find({ type: 'growthHack' }).toArray();

  // // Insert documents into each stages collections collection

  if (dealStages.length > 0) {
    await Deal_Stages.insertMany(dealStages);
  }

  if (taskStages.length > 0) {
    await Task_Stages.insertMany(taskStages);
  }

  if (ticketStages.length > 0) {
    await Ticket_Stages.insertMany(ticketStages);
  }

  if (purchaseStages.length > 0) {
    await Purchase_Stages.insertMany(purchaseStages);
  }

  if (ghStages.length > 0) {
    await GH_Stages.insertMany(ghStages);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
