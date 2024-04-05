import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Checklists: Collection<any>;
let Deal_Checklists: Collection<any>;
let Task_Checklists: Collection<any>;
let Ticket_Checklists: Collection<any>;
let Purchase_Checklists: Collection<any>;
let GH_Checklists: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  Checklists = db.collection('checklists');
  Deal_Checklists = db.collection('deal_checklists');
  Task_Checklists = db.collection('task_checklists');
  Ticket_Checklists = db.collection('ticket_checklists');
  Purchase_Checklists = db.collection('purchase_checklists');
  GH_Checklists = db.collection('growthhack_checklists');

  const dealChecklists = await Checklists.find({
    contentType: 'deal',
  }).toArray();
  const taskChecklists = await Checklists.find({
    contentType: 'task',
  }).toArray();
  const ticketChecklists = await Checklists.find({
    contentType: 'ticket',
  }).toArray();
  const purchaseChecklists = await Checklists.find({
    contentType: 'purchase',
  }).toArray();
  const ghChecklists = await Checklists.find({
    contentType: 'growthHack',
  }).toArray();

  // // Insert documents into each check list collections collection

  if (dealChecklists.length > 0) {
    await Deal_Checklists.insertMany(dealChecklists);
  }

  if (taskChecklists.length > 0) {
    await Task_Checklists.insertMany(taskChecklists);
  }

  if (ticketChecklists.length > 0) {
    await Ticket_Checklists.insertMany(ticketChecklists);
  }

  if (purchaseChecklists.length > 0) {
    await Purchase_Checklists.insertMany(purchaseChecklists);
  }

  if (ghChecklists.length > 0) {
    await GH_Checklists.insertMany(ghChecklists);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
