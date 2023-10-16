import { model } from 'mongoose';
import { Schema } from 'mongoose';
import * as _ from 'underscore';

export const polarissyncSchema = new Schema({
  customerId: String,
  data: Object,
  createdAt: Date,
  updatedAt: Date
});

export const loadPolarissyncClass = () => {
  class Polarissync {
    // create
    public static async createOrUpdate(doc) {
      const existingData = await Polarissyncs.findOne({
        customerId: doc.customerId
      });

      if (existingData) {
        await Polarissyncs.updateOne(
          { customerId: doc.customerId },
          { $set: { data: doc.data, updatedAt: new Date() } }
        );

        return Polarissyncs.findOne({ customerId: doc.customerId });
      } else {
        return Polarissyncs.create({
          ...doc,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  polarissyncSchema.loadClass(Polarissync);

  return polarissyncSchema;
};

export const Polarissyncs = model<any, any>(
  'polaris_datas',
  loadPolarissyncClass()
);
