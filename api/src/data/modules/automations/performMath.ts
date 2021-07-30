import * as models from '../../../db/models';
import { sendError } from './utils';

export const receiveRpcMessagePerformMath = async doc => {
  const { module, field, result } = doc;

  if (!Object.keys(models).includes(module)) {
    return sendError('wrong module');
  }

  const value = await models[module].findOne({ _id }, { [field]: 1 }).lean();

  const newVal = value + op2;

  await models[module].updateOne({ _id }, { $set: { [field]: newVal } });
};
