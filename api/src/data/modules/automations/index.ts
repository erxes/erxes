import * as allModels from '../../../db/models';
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

  if (action === 'findObjects') {
    if (!Object.keys(allModels).includes(doc.model)) {
      return sendError('undefined model');
    }

    return sendSuccess(
      await allModels[doc.model].find({ ...doc.selector }).lean()
    );
  }

  if (action === 'getObject') {
    if (!Object.keys(allModels).includes(doc.model)) {
      return sendError('undefined model');
    }

    return sendSuccess(
      await allModels[doc.model].findOne({ ...doc.selector }).lean()
    );
  }

  return receiveRpcMessageBoardItem(action, doc);
};
