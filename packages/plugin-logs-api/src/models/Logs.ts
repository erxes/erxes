import { Document, Model, Schema } from 'mongoose';
import { debug } from '../configs';
import { IModels } from '../connectionResolver';
import { compareObjects } from '../utils';
import { field } from './utils';

export interface ILogDoc {
  createdAt: Date;
  createdBy: string;
  type: string;
  ipAddress?: string;
  action: string;
  object?: string;
  unicode?: string;
  description?: string;
  oldData?: string;
  newData?: string;
  objectId?: string;
  addedData?: string;
  changedData?: string;
  unchangedData?: string;
  removedData?: string;
  extraDesc?: string;
}

export interface ILogDocument extends ILogDoc, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILogDoc): Promise<ILogDocument>;
}

export const schema = new Schema({
  createdAt: field({
    type: Date,
    label: 'Created date',
    index: true,
    default: new Date()
  }),
  createdBy: field({ type: String, label: 'Performer of the action' }),
  type: field({
    type: String,
    label: 'Service & module name which has been changed, i.e cards:deal'
  }),
  action: field({
    type: String,
    label: 'Action, one of (create|update|delete)'
  }),
  ipAddress: field({ type: String, optional: true, label: 'IP address' }),
  objectId: field({ type: String, label: 'Collection row id' }),
  unicode: field({ type: String, label: 'Performer username' }),
  description: field({
    type: String,
    label: 'Description',
    optional: true,
    default: ''
  }),
  // restore db from these if disaster happens
  oldData: field({
    type: String,
    label: 'Data before changes',
    optional: true
  }),
  newData: field({ type: String, label: 'Data to be changed', optional: true }),
  // processed data to show in front side
  addedData: field({
    type: String,
    label: 'Newly added fields',
    optional: true
  }),
  unchangedData: field({
    type: String,
    label: 'Unchanged fields',
    optional: true
  }),
  changedData: field({ type: String, label: 'Changed fields', optional: true }),
  removedData: field({ type: String, label: 'Removed fields', optional: true }),
  extraDesc: field({ type: String, label: 'Extra description', optional: true })
});

export const loadLogClass = (models: IModels) => {
  class Log {
    public static createLog(doc: ILogDoc) {
      const { object = '{}', newData } = doc;
      const logDoc = { ...doc };

      let oldData;
      let parsedNewData;

      try {
        oldData = JSON.parse(object);

        if (newData) {
          parsedNewData = JSON.parse(newData);
        }
      } catch (e) {
        debug.error(`JSON parsing error: ${e.message}`);
        oldData = JSON.parse(object.replace('\n', ''));
      }

      if (oldData._id) {
        logDoc.objectId = oldData._id;
      }

      let checkUpdate = true;

      switch (doc.action) {
        case 'create':
          logDoc.addedData = JSON.stringify(parsedNewData);
          break;
        case 'update':
          if (oldData && newData) {
            try {
              const comparison = compareObjects(oldData, parsedNewData);

              // store exactly how it was for safety purpose
              logDoc.oldData = JSON.stringify(oldData);
              // it comes as string already
              logDoc.newData = newData;

              logDoc.addedData = JSON.stringify(comparison.added);
              logDoc.changedData = JSON.stringify(comparison.changed);
              logDoc.unchangedData = JSON.stringify(comparison.unchanged);
              logDoc.removedData = JSON.stringify(comparison.removed);

              if (
                logDoc.addedData === '{}' &&
                logDoc.changedData === '{}' &&
                logDoc.removedData === '{}'
              ) {
                checkUpdate = false;
              }
            } catch (e) {
              debug.error(`object comparison error: ${e.message}`);
            }
          }

          break;
        case 'delete':
          logDoc.oldData = JSON.stringify(oldData);
          logDoc.removedData = JSON.stringify(oldData);
          break;
        default:
          break;
      }

      if (!checkUpdate) {
        return;
      }

      return models.Logs.create(logDoc);
    }
  }

  schema.loadClass(Log);

  return schema;
};
