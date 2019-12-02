import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { fillSearchTextItem, updateOrder, watchItem } from './boardUtils';
import { IOrderInput } from './definitions/boards';
import { dealSchema, IDeal, IDealDocument } from './definitions/deals';

export interface IDealModel extends Model<IDealDocument> {
  getDeal(_id: string): Promise<IDealDocument>;
  createDeal(doc: IDeal): Promise<IDealDocument>;
  updateDeal(_id: string, doc: IDeal): Promise<IDealDocument>;
  updateOrder(stageId: string, orders: IOrderInput[]): Promise<IDealDocument[]>;
  watchDeal(_id: string, isAdd: boolean, userId: string): void;
}

export const loadDealClass = () => {
  class Deal {
    public static async getDeal(_id: string) {
      const deal = await Deals.findOne({ _id });

      if (!deal) {
        throw new Error('Deal not found');
      }

      return deal;
    }

    /**
     * Create a deal
     */
    public static async createDeal(doc: IDeal) {
      const dealsCount = await Deals.find({
        stageId: doc.stageId,
      }).countDocuments();

      const deal = await Deals.create({
        ...doc,
        order: dealsCount,
        modifiedAt: new Date(),
        searchText: fillSearchTextItem(doc),
      });

      // create log
      await ActivityLogs.createDealLog(deal);

      return deal;
    }

    /**
     * Update Deal
     */
    public static async updateDeal(_id: string, doc: IDeal) {
      const searchText = fillSearchTextItem(doc, await Deals.getDeal(_id));

      await Deals.updateOne({ _id }, { $set: doc, searchText });

      return Deals.findOne({ _id });
    }

    /*
     * Update given deals orders
     */
    public static async updateOrder(stageId: string, orders: IOrderInput[]) {
      return updateOrder(Deals, orders, stageId);
    }

    /**
     * Watch deal
     */
    public static watchDeal(_id: string, isAdd: boolean, userId: string) {
      return watchItem(Deals, _id, isAdd, userId);
    }
  }

  dealSchema.loadClass(Deal);

  return dealSchema;
};

loadDealClass();

// tslint:disable-next-line
const Deals = model<IDealDocument, IDealModel>('deals', dealSchema);

export default Deals;
