import { Model } from 'mongoose';
import { LOG_STATUSES } from '../constants';
import { StatusType } from '~/types';
import { ILogDocument } from 'erxes-api-shared/core-types';

type CommonObject = {
  source: 'mongo';
  status: StatusType;
};

const insert = async (
  Logs: Model<ILogDocument>,
  collectionName: string,
  docId: string,
  commonObj: CommonObject,
  changeEvent,
) => {
  return await Logs.insertOne({
    action: 'create',
    docId,
    payload: { collectionName, fullDocument: changeEvent.fullDocument },
    createdAt: new Date(),
    ...commonObj,
  });
};

const update = async (
  Logs: Model<ILogDocument>,
  collectionName: string,
  docId: string,
  commonObj: CommonObject,
  changeEvent,
) => {
  const prevLog = await Logs.findOne({ docId }).sort({ createdAt: -1 }).lean();

  return await Logs.insertOne({
    action: 'update',
    docId: String(docId),
    payload: {
      collectionName,
      fullDocument: changeEvent.fullDocument,
      prevDocument: prevLog?.payload?.fullDocument,
      updateDescription: changeEvent.updateDescription,
    },
    createdAt: new Date(),
    ...commonObj,
  });
};

const remove = async (
  Logs: Model<ILogDocument>,
  collectionName: string,
  docId: string,
  commonObj: CommonObject,
) => {
  const prevLog = await Logs.findOne({ docId }).sort({ createdAt: -1 }).lean();

  return await Logs.insertOne({
    action: 'remove',
    docId: String(docId),
    payload: { collectionName, prevDocument: prevLog?.payload?.fullDocument },
    createdAt: new Date(),
    ...commonObj,
  });
};

const actionMap = {
  insert,
  update,
  delete: remove,
};

export const handleMongoChangeEvent = async (
  Logs: Model<ILogDocument>,
  changeEvent: any,
  contentType?: string,
) => {
  // MongoDB client setup
  const operationType = changeEvent.operationType;
  const collectionName = changeEvent.ns.coll;
  const docId = changeEvent.documentKey._id;
  const { processId } = changeEvent?.fullDocument || {};

  const action = actionMap[operationType];
  return await action(
    Logs,
    collectionName,
    docId,
    { source: 'mongo', status: LOG_STATUSES.SUCCESS, processId, contentType },
    changeEvent,
    processId,
  );
};
