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
let ChecklistItems: Collection<any>;
let Deal_ChecklistItems: Collection<any>;
let Task_ChecklistItems: Collection<any>;
let Ticket_ChecklistItems: Collection<any>;
let Purchase_ChecklistItems: Collection<any>;
let GH_ChecklistItems: Collection<any>;

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  ChecklistItems = db.collection('checklist_items');
  Checklists = db.collection('checklists');
  Deal_ChecklistItems = db.collection('deal_checklist_items');
  Task_ChecklistItems = db.collection('task_checklist_items');
  Ticket_ChecklistItems = db.collection('ticket_checklist_items');
  Purchase_ChecklistItems = db.collection('purchase_checklist_items');
  GH_ChecklistItems = db.collection('growthhack_checklist_items');

  const checklistItemsArray = await ChecklistItems.find().toArray();

  for (const item of checklistItemsArray) {
    // Find the corresponding checklist document
    const checklist = await Checklists.findOne({
      _id: item.checklistId,
    });

    if (checklist) {
      const contentType = checklist.contentType;

      if (contentType === 'deal') {
        await Deal_ChecklistItems.insertOne(item);
      }

      if (contentType === 'task') {
        await Task_ChecklistItems.insertOne(item);
      }

      if (contentType === 'ticket') {
        await Ticket_ChecklistItems.insertOne(item);
      }

      if (contentType === 'purchase') {
        await Purchase_ChecklistItems.insertOne(item);
      }

      if (contentType === 'growthHack') {
        await GH_ChecklistItems.insertOne(item);
      }
    }
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
