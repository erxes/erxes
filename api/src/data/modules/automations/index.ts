import { isInSegment } from '../segments/queryBuilder';
import { receiveRpcMessageBoardItem } from './boardItems';
import { sendSuccess } from './utils';

export const receiveRpcMessage = async msg => {
  const { action, payload } = msg;

  const doc = JSON.parse(payload || '{}');

  if (action === 'isInSegment') {
    return sendSuccess({
      check: await isInSegment(doc.segmentId, doc.targetId)
    });
  }

  return receiveRpcMessageBoardItem(action, doc);
};
