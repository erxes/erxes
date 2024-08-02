import { Model } from "mongoose";
import { debugError } from "@erxes/api-utils/src/debuggers";
import { ILogDoc, ILogDocument, logsSchema } from "./definitions/logs";
import { IModels } from "../../connectionResolver";
import { compareObjects } from "../utils/logUtils";

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc: ILogDoc): Promise<ILogDocument>;
}

export const loadLogClass = (models: IModels) => {
  class Log {
    public static createLog(doc: ILogDoc) {
      const { object = "{}", newData } = doc;
      const logDoc = { ...doc };

      let oldData;
      let parsedNewData;

      try {
        oldData = JSON.parse(object);

        if (newData) {
          parsedNewData = JSON.parse(newData);
        }
      } catch (e) {
        debugError(`JSON parsing error: ${e.message}`);
        oldData = JSON.parse(object.replace("\n", ""));
      }

      if (oldData._id) {
        logDoc.objectId = oldData._id;
      }

      let checkUpdate = true;

      switch (doc.action) {
        case "create":
          logDoc.addedData = JSON.stringify(parsedNewData);
          break;
        case "update":
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
                logDoc.addedData === "{}" &&
                logDoc.changedData === "{}" &&
                logDoc.removedData === "{}"
              ) {
                checkUpdate = false;
              }
            } catch (e) {
              debugError(`object comparison error: ${e.message}`);
            }
          }

          break;
        case "delete":
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

  logsSchema.loadClass(Log);

  return logsSchema;
};
