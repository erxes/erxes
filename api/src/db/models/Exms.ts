import { Model, model } from 'mongoose';

import { exmSchema, IExm, IExmDocument } from './definitions/exms';
import { IUserDocument } from './definitions/users';

export interface IExmModel extends Model<IExmDocument> {
  getExm(_id: string): Promise<IExmDocument>;
  createExm(doc: IExm, user: IUserDocument): Promise<IExmDocument>;
  updateExm(_id: string, doc: IExm): Promise<IExmDocument>;
  removeExm(_id: string): void;
}

export const loadClass = () => {
  class Exm {
    public static async getExm(_id: string) {
      const exm = await Exms.findOne({ _id });

      if (!exm) {
        throw new Error('Exm not found');
      }

      return exm;
    }

    /*
     * Create new exm
     */
    public static async createExm(doc: IExm, user: IUserDocument) {
      const exm = await Exms.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });

      return exm;
    }

    /*
     * Update exm
     */
    public static async updateExm(_id: string, doc: IExm) {
      await Exms.updateOne({ _id }, { $set: doc });

      return Exms.findOne({ _id });
    }

    /*
     * Remove exm
     */
    public static async removeExm(_id: string) {
      const exmObj = await Exms.getExm(_id);

      return exmObj.remove();
    }
  }

  exmSchema.loadClass(Exm);

  return exmSchema;
};

loadClass();

// tslint:disable-next-line
const Exms = model<IExmDocument, IExmModel>('exms', exmSchema);

export default Exms;
