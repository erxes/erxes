import { allModels } from '../../../pluginUtils';
import { Conformities } from '../../../db/models';
import { isInSegment } from '../segments/queryBuilder';
import { receiveRpcMessageBoardItem } from './boardItems';
import { sendError, sendSuccess } from './utils';

export const receiveRpcMessage = async msg => {
  const { action, payload } = msg;

  const doc = JSON.parse(payload || '{}');

  if (action === 'isInSegment') {
    return sendSuccess({
      check: await isInSegment(doc.segmentId, doc.targetId)
    });
  }

  if (action === 'get-object') {
    if (!Object.keys(allModels).includes(doc.model)) {
      return sendError('undefined model');
    }

    let object = [];
    try {
      if (doc.call) {
        object = await allModels[doc.model][doc.call](doc.id);
      } else {
        object = await allModels[doc.model].findOne({ _id: doc.id }).lean();
      }

      return sendSuccess(object);
    } catch (e) {
      return sendSuccess({ error: e.message });
    }
  }

  if (action === 'find-objects') {
    if (!Object.keys(allModels).includes(doc.model)) {
      return sendError('undefined model');
    }

    try {
      const objects = await allModels[doc.model]
        .find({ ...doc.selector })
        .lean();
      return sendSuccess(objects);
    } catch (e) {
      return sendSuccess({ error: e.message });
    }
  }

  if (action.includes('find-conformities')) {
    const relTypeByModel = {
      customer: 'Customers',
      company: 'Companies',
      deal: 'Deals',
      task: 'Tasks',
      ticket: 'Tickets'
    };
    const model = relTypeByModel[doc.relType] || doc.model;

    if (!Object.keys(allModels).includes(model)) {
      return sendError('undefined model');
    }

    const conformities = await Conformities.savedConformity({
      mainType: doc.mainType,
      mainTypeId: doc.mainTypeId,
      relTypes: [doc.relType]
    });
    const collection = allModels[model];

    return sendSuccess(
      await collection.find({ _id: { $in: conformities } }).lean()
    );
  }

  if (action === 'set-conformities') {
    const { mainType, mainTypeId, relType, relTypeIds } = doc;
    return sendSuccess(
      await Conformities.editConformity({
        mainType,
        mainTypeId,
        relType,
        relTypeIds
      })
    );
  }

  if (action === 'remove-objects') {
    const { model, call, ids } = doc;
    if (!Object.keys(allModels).includes(model)) {
      return sendError('undefined model');
    }

    try {
      return sendSuccess(await allModels[model][call](ids));
    } catch (e) {
      return sendSuccess({ error: e.message });
    }
  }

  if (action.includes('set-property')) {
    if (!Object.keys(allModels).includes(doc.model)) {
      return sendError('undefined model');
    }

    try {
      const collection = allModels[doc.model];

      const result = await collection.update(
        { _id: doc._id },
        { $set: { ...(doc.setDoc || {}) } }
      );

      return sendSuccess(result);
    } catch (e) {
      return sendSuccess({ error: e.message });
    }
  }

  if (action === 'add-object') {
    if (!Object.keys(allModels).includes(doc.model)) {
      return sendError('undefined model');
    }
    try {
      const object = await allModels[doc.model][doc.call]({ ...doc });
      if (doc.conformity) {
        await Conformities.addConformity({
          ...doc.conformity,
          relTypeId: object._id
        });
      }

      return sendSuccess(object);
    } catch (e) {
      return sendSuccess({ error: e.message });
    }
  }

  return receiveRpcMessageBoardItem(action, doc);
};
