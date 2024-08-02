import { Model } from "mongoose";
import { debugInfo } from "@erxes/api-utils/src/debuggers";
import { IModels } from "../../connectionResolver";
import {
  IVisitorDocument,
  IVistiorDoc,
  visitorSchema
} from "./definitions/visitors";

export interface IVisitorModel extends Model<IVisitorDocument> {
  createOrUpdateVisitorLog(doc: IVistiorDoc): Promise<IVisitorDocument>;
  updateVisitorLog(doc: IVistiorDoc): Promise<IVisitorDocument>;
  removeVisitorLog(visitorId: string): void;
  getVisitorLog(visitorId: string): Promise<IVisitorDocument>;
}

export const loadVisitorClass = (models: IModels) => {
  class Visitor {
    public static async createOrUpdateVisitorLog(doc: IVistiorDoc) {
      const visitor = await models.Visitors.findOne({
        visitorId: doc.visitorId
      });

      if (visitor) {
        await models.Visitors.updateOne({ _id: visitor._id }, { $set: doc });

        return models.Visitors.findOne({ visitorId: doc.visitorId });
      }

      return models.Visitors.create({
        ...doc,
        sessionCount: 1,
        lastSeenAt: new Date()
      });
    }

    public static async updateVisitorLog(doc: IVistiorDoc) {
      const now = new Date();

      const visitor = await models.Visitors.getVisitorLog(doc.visitorId);

      // log & quietly return instead of throwing an error
      if (!visitor) {
        debugInfo(
          `Visitor with Id ${doc.visitorId} not found while trying to update visitor.`
        );

        return;
      }

      delete doc.integrationId;

      const query: any = {
        $set: {
          lastSeenAt: now,
          ...doc
        }
      };

      // Preventing session count to increase on page every refresh
      // Close your web site tab and reopen it after 6 seconds then it will increase
      // session count by 1
      if (
        visitor.lastSeenAt &&
        now.getTime() - visitor.lastSeenAt.getTime() > 6 * 1000
      ) {
        // update session count
        query.$inc = { sessionCount: 1 };
      }

      // update
      await models.Visitors.findOneAndUpdate(
        { visitorId: doc.visitorId },
        query
      );

      // updated customer
      return models.Visitors.findOne({ visitorId: doc.visitorId });
    }

    public static getVisitorLog(visitorId: string) {
      return models.Visitors.findOne({ visitorId }).lean();
    }

    public static removeVisitorLog(visitorId: string) {
      return models.Visitors.deleteOne({ visitorId });
    }
  }

  visitorSchema.loadClass(Visitor);

  return visitorSchema;
};
