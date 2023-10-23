import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const typeSchema = new Schema({
  name: String
});

export const reportsSchema = new Schema({
  name: String,
  createdAt: Date,
  expiryDate: Date,
  checked: Boolean,
  typeId: String
});

export const loadTypeClass = () => {
  class Type {
    public static async getType(_id: string) {
      const type = await Types.findOne({ _id });

      if (!type) {
        throw new Error('Type not found');
      }

      return type;
    }
    // create type
    public static async createType(doc) {
      return Types.create({ ...doc });
    }
    // remove type
    public static async removeType(_id: string) {
      return Types.deleteOne({ _id });
    }

    public static async updateType(_id: string, doc) {
      return Types.updateOne({ _id }, { $set: { ...doc } });
    }
  }

  typeSchema.loadClass(Type);
  return typeSchema;
};

export const loadReportsClass = () => {
  class Reports {
    public static async getReports(_id: string) {
      const reports = await Reportss.findOne({ _id });

      if (!reports) {
        throw new Error('Reports not found');
      }

      return reports;
    }

    // create
    public static async createReports(doc) {
      return Reportss.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateReports(_id: string, doc) {
      await Reportss.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removeReports(_id: string) {
      return Reportss.deleteOne({ _id });
    }
  }

  reportsSchema.loadClass(Reports);

  return reportsSchema;
};

loadReportsClass();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>('reports_types', typeSchema);

// tslint:disable-next-line
export const Reportss = model<any, any>('reportss', reportsSchema);
