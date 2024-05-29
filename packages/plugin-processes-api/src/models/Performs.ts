import * as moment from 'moment';
import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IPerform,
  IPerformDocument,
  performSchema
} from './definitions/performs';

export interface IPerformModel extends Model<IPerformDocument> {
  getPerform(_id: string): Promise<IPerformDocument>;
  createPerform(doc: IPerform): Promise<IPerformDocument>;
  updatePerform(
    _id: string,
    doc: IPerform,
    perform?: IPerformDocument
  ): Promise<IPerformDocument>;
  removePerform(_id: string): void;
}

export const loadPerformClass = (models: IModels) => {
  class Perform {
    /*
     * Get a perform
     */
    public static async getPerform(_id: string) {
      const perform = await models.Performs.findOne({ _id }).lean();

      if (!perform) {
        throw new Error('Perform not found');
      }

      return perform;
    }

    /**
     * Create a perform
     */
    public static async createPerform(doc: IPerform, len?: number) {
      let series = '';
      if (doc.endAt) {
        const dateStr = `${moment(doc.endAt).format('YYYYMMDD HHmmss SSS')}`;
        series = `${dateStr}${
          len
            ? (len + 1).toString().padStart(2, '0')
            : Math.round(Math.random() * (99 - 1) + 1)
                .toString()
                .padStart(2, '0')
        }`;
      }

      let perform;
      try {
        perform = await models.Performs.create({
          ...doc,
          createdAt: new Date(),
          series
        });
      } catch (e) {
        if (e.message.includes(`E11000 duplicate key error dup key`)) {
          return await this.createPerform(
            doc,
            await models.Performs.find({ series }).count()
          );
        } else {
          throw new Error(e.message);
        }
      }
      return perform;
    }

    /**
     * Update Perform
     */
    public static async updatePerform(
      _id: string,
      doc: IPerform,
      perform?: IPerformDocument,
      len?: number
    ) {
      const oldPerform = perform || (await models.Performs.getPerform(_id));
      let series = oldPerform.series;
      if (doc.endAt && !oldPerform.series) {
        const dateStr = `${moment(doc.endAt).format('YYYYMMDD HHmmss SSS')}`;
        series = `${dateStr}${
          len
            ? (len + 1).toString().padStart(2, '0')
            : Math.round(Math.random() * (99 - 1) + 1)
                .toString()
                .padStart(2, '0')
        }`;
      }

      try {
        await models.Performs.updateOne({ _id }, { $set: { ...doc, series } });
      } catch (e) {
        if (e.message.includes(`E11000 duplicate key error dup key`)) {
          return await this.updatePerform(
            _id,
            doc,
            oldPerform,
            await models.Performs.find({ series }).count()
          );
        } else {
          throw new Error(e.message);
        }
      }

      const updated = await models.Performs.getPerform(_id);

      return updated;
    }

    /**
     * Remove Perform
     */
    public static async removePerform(_id: string) {
      return models.Performs.deleteOne({ _id });
    }
  }

  performSchema.loadClass(Perform);

  return performSchema;
};
