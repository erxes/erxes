import * as dotenv from 'dotenv';

import { connect } from '../db/connection';
import {
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
      if ((await Companies.countDocuments({ _id: conformity[typeId] })) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'customer':
      if ((await Customers.countDocuments({ _id: conformity[typeId] })) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'deal':
      if ((await Deals.countDocuments({ _id: conformity[typeId] })) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'task':
      if ((await Tasks.countDocuments({ _id: conformity[typeId] })) === 0) {
        toDelConformityIds.push(conformity._id);
      }
      break;
    case 'ticket':
      if ((await Tickets.countDocuments({ _id: conformity[typeId] })) === 0) {
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

const contentHelper = async (obj, toDelIds, idField = 'contentTypeId') => {
  switch (obj.contentType) {
    case 'deal':
      if ((await Deals.countDocuments({ _id: obj[idField] })) === 0) {
        toDelIds.push(obj._id);
      }
      break;

    case 'ticket':
      if ((await Tickets.countDocuments({ _id: obj[idField] })) === 0) {
        toDelIds.push(obj._id);
      }
      break;

    case 'task':
      if ((await Tasks.countDocuments({ _id: obj[idField] })) === 0) {
        toDelIds.push(obj._id);
      }
      break;

    case 'company':
      if ((await Companies.countDocuments({ _id: obj[idField] })) === 0) {
        toDelIds.push(obj._id);
      }
      break;

    case 'customer':
      if ((await Customers.countDocuments({ _id: obj[idField] })) === 0) {
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
  let skip = 0;

  console.log('-------------- start conformities');

  const allConfCount = await Conformities.find().countDocuments();

  for (let j = 0; j <= allConfCount; j = j + step) {
    console.log('step By conformities', j);
    const toDelConformityIds: string[] = [];
    const all_conf = await Conformities.find({})
      .skip(skip)
      .limit(step);

    for (const c of all_conf) {
      sumCo = sumCo + 1;
      await conformityHelper(c, 'mainType', toDelConformityIds);
      await conformityHelper(c, 'relType', toDelConformityIds);
    }

    const delCount = toDelConformityIds.length;
    sco = sco + delCount;
    skip = skip + step - delCount;
    console.log('delCount', delCount);

    await Conformities.deleteMany({ _id: { $in: toDelConformityIds } });
  }
  console.log(sco, ' summary recycle conformities');
  console.log(sumCo, ' summary conformities');

  // ================= internalNotes check
  sumCo = 0;
  sco = 0;
  skip = 0;

  console.log('-------------- start internalNotes');

  const allNoteCount = await InternalNotes.countDocuments({
    contentType: { $in: ['task', 'deal', 'ticket', 'customer', 'company'] }
  });

  for (let j = 0; j <= allNoteCount; j = j + step) {
    console.log('step By InternalNotes', j);
    const toDelNoteIds: string[] = [];
    const allNotes = await InternalNotes.find({
      contentType: { $in: ['task', 'deal', 'ticket', 'customer', 'company'] }
    })
      .skip(skip)
      .limit(step);

    for (const note of allNotes) {
      sumCo = sumCo + 1;
      await contentHelper(note, toDelNoteIds);
    }

    const delCount = toDelNoteIds.length;
    sco = sco + delCount;
    skip = skip + step - delCount;
    console.log('delCount', delCount);

    await InternalNotes.deleteMany({ _id: { $in: toDelNoteIds } });
  }
  console.log(sco, ' summary recycle internalNotes');
  console.log(sumCo, ' summary internalNotes');

  // =========== checklist check
  sumCo = 0;
  sco = 0;
  skip = 0;

  console.log('-------------- start checklists and checlistItems');

  const allChecklistCount = await Checklists.countDocuments({
    contentType: { $in: ['task', 'deal', 'ticket'] }
  });

  for (let j = 0; j <= allChecklistCount; j = j + step) {
    console.log('step By Checklists', j);
    const toDelChecklistIds: string[] = [];
    const allChecklists = await Checklists.find({
      contentType: { $in: ['task', 'deal', 'ticket'] }
    })
      .skip(skip)
      .limit(step);

    for (const checklist of allChecklists) {
      sumCo = sumCo + 1;
      await contentHelper(checklist, toDelChecklistIds);
    }

    const delCount = toDelChecklistIds.length;
    sco = sco + delCount;
    skip = skip + step - delCount;
    console.log('delCount', delCount);

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
