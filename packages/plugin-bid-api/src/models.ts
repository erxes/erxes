import { Schema, model } from 'mongoose';
import { IModels } from './connectionResolver';

export const polarissyncSchema = new Schema({
  customerId: String,
  data: Object,
  createdAt: Date,
  updatedAt: Date,
});

export const loadPolarissyncClass = (models: IModels) => {
  class Polarissync {
    // create
    public static async createOrUpdate(doc) {
      const existingData = await models.Polarissyncs.findOne({
        customerId: doc.customerId,
      });

      if (existingData) {
        await models.Polarissyncs.updateOne(
          { customerId: doc.customerId },
          { $set: { data: doc.data, updatedAt: new Date() } },
        );

        return models.Polarissyncs.findOne({ customerId: doc.customerId });
      } else {
        return models.Polarissyncs.create({
          ...doc,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }

  polarissyncSchema.loadClass(Polarissync);

  return polarissyncSchema;
};
