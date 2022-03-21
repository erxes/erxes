import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IExm {}

export interface IExmDocument extends IExm, Document {
  _id: string;
}

export const exmSchema = new Schema({});

export interface IExmModel extends Model<IExmDocument> {
  createExm(doc: IExm, user: any): IExmDocument;
}

export const loadExmClass = (models: IModels) => {
  class Exm {
    public static async createExm(doc: IExm, user: any) {
      const exm = await models.Exms.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });

      return exm;
    }
  }

  exmSchema.loadClass(Exm);

  return exmSchema;
};
