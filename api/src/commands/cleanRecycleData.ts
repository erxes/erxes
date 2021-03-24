import * as dotenv from 'dotenv';

import { connect } from '../db/connection';
// import {  Deals, InternalNotes, Tasks, Tickets } from '../db/models';
import {
  ActivityLogs,
  ChecklistItems,
  Checklists,
  Companies,
  Conformities,
  Customers,
  Deals,
  InternalNotes,
  Tasks,
  Tickets
} from '../db/models';

dotenv.config();

const conformityHelper = async (conformity, type, toDelConformityIds) => {
  const typeId = `${type}Id`;
  switch (conformity[type]) {
    case 'company':
      if ((await Companies.find({ _id: conformity[typeId] }).count()) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'customer':
      if ((await Customers.find({ _id: conformity[typeId] }).count()) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'deal':
      if ((await Deals.find({ _id: conformity[typeId] }).count()) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'task':
      if ((await Tasks.find({ _id: conformity[typeId] }).count()) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'ticket':
      if ((await Tickets.find({ _id: conformity[typeId] }).count()) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;

    default:
      console.log(
        'outer type ',
        type,
        conformity[type],
        conformity[typeId],
        ' ---- ',
        conformity._id
      );
  }
};

const otherHelper = async (obj, toDelIds, idField = 'contentTypeId') => {
  switch (obj.contentType) {
    case 'deal':
      if ((await Deals.find({ _id: obj[idField] }).count()) === 0) {
        toDelIds.push(obj._id);
      }
      break;

    case 'ticket':
      if ((await Tickets.find({ _id: obj[idField] }).count()) === 0) {
        toDelIds.push(obj._id);
      }
      break;

    case 'task':
      if ((await Tasks.find({ _id: obj[idField] }).count()) === 0) {
        toDelIds.push(obj._id);
      }
      break;
  }
};

const command = async () => {
  await connect();

  const step = 10000;

  // ============= Conformities check
  let sumCo = 0;
  let sco = 0;

  console.log('-------------- start conformities');

  const allConfCount = await Conformities.find().count();

  for (let j = 0; j <= allConfCount; j = j + step) {
    console.log('step By conformities', j);
    const toDelConformityIds: string[] = [];
    const all_conf = await Conformities.find({})
      .skip(j)
      .limit(step);

    for (const c of all_conf) {
      sumCo = sumCo + 1;
      await conformityHelper(c, 'mainType', toDelConformityIds);
      await conformityHelper(c, 'relType', toDelConformityIds);
    }

    sco = sco + toDelConformityIds.length;
    console.log('per step delete conformities: ', toDelConformityIds.length);
    await Conformities.deleteMany({ _id: { $in: toDelConformityIds } });
  }
  console.log(sco, ' summary recycle conformities');
  console.log(sumCo, ' summary conformities');

  // ================= internalNotes check
  sumCo = 0;
  sco = 0;

  console.log('-------------- start internalNotes');

  const allNoteCount = await InternalNotes.find({
    contentType: { $in: ['task', 'deal', 'ticket'] }
  }).count();

  for (let j = 0; j <= allNoteCount; j = j + step) {
    console.log('step By InternalNotes', j);
    const toDelNoteIds: string[] = [];
    const allNotes = await InternalNotes.find({
      contentType: { $in: ['task', 'deal', 'ticket'] }
    })
      .skip(j)
      .limit(step);

    for (const note of allNotes) {
      sumCo = sumCo + 1;
      await otherHelper(note, toDelNoteIds);
    }

    sco = sco + toDelNoteIds.length;
    await InternalNotes.deleteMany({ _id: { $in: toDelNoteIds } });
  }
  console.log(sco, ' summary recycle internalNotes');
  console.log(sumCo, ' summary internalNotes');

  // ========== activityLogs check
  sumCo = 0;
  sco = 0;

  console.log('-------------- start activityLogs');

  const allLogCount = await ActivityLogs.find({
    contentType: { $in: ['task', 'deal', 'ticket'] }
  }).count();

  for (let j = 0; j <= allLogCount; j = j + step) {
    console.log('step By AcitivityCount', j);
    const toDelLogIds: string[] = [];
    const allActivityLogs = await ActivityLogs.find({
      contentType: { $in: ['task', 'deal', 'ticket'] }
    })
      .skip(j)
      .limit(step);

    for (const log of allActivityLogs) {
      sumCo = sumCo + 1;
      await otherHelper(log, toDelLogIds, 'contentId');
    }

    sco = sco + toDelLogIds.length;
    await ActivityLogs.deleteMany({ _id: { $in: toDelLogIds } });
  }
  console.log(sco, ' summary recycle ActivityLogs');
  console.log(sumCo, ' summary ActivityLogs');

  // =========== checklist check
  sumCo = 0;
  sco = 0;

  console.log('-------------- start checklists and checlistItems');

  const allChecklistCount = await Checklists.find({
    contentType: { $in: ['task', 'deal', 'ticket'] }
  }).count();

  for (let j = 0; j <= allChecklistCount; j = j + step) {
    console.log('step By Checklists', j);
    const toDelChecklistIds: string[] = [];
    const allChecklists = await Checklists.find({
      contentType: { $in: ['task', 'deal', 'ticket'] }
    })
      .skip(j)
      .limit(step);

    for (const checklist of allChecklists) {
      sumCo = sumCo + 1;
      await otherHelper(checklist, toDelChecklistIds);
    }

    sco = sco + toDelChecklistIds.length;
    await ChecklistItems.deleteMany({
      checklistId: { $in: toDelChecklistIds }
    });
    await Checklists.deleteMany({ _id: { $in: toDelChecklistIds } });
  }
  console.log(sco, ' summary recycle checklist');
  console.log(sumCo, ' summary checklist');

  process.exit();
};

command();
