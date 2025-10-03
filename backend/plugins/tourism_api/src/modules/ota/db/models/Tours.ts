import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import { IOTATour, IOTATourDocument } from '@/ota/@types/tours';
import { otaTourSchema } from '@/ota/db/definitions/tours';

export interface IOTATourModel extends Model<IOTATourDocument> {
  createTour: (data: IOTATour) => Promise<IOTATourDocument>;
  updateTour: (
    id: string,
    data: Partial<IOTATour>,
  ) => Promise<IOTATourDocument | null>;
  deleteTour: (id: string) => Promise<IOTATourDocument | null>;
}

export const loadOTATourClass = (models: IModels) => {
  class OTATours {
    public static createTour = async (data: IOTATour) => {
      return models.OTATours.create(data);
    };

    public static updateTour = async (_id: string, data: Partial<IOTATour>) => {
      return models.OTATours.findOneAndUpdate(
        { _id },
        { $set: data },
        { new: true },
      );
    };

    public static deleteTour = async (_id: string) => {
      return models.OTATours.findOneAndDelete({ _id });
    };
  }

  otaTourSchema.loadClass(OTATours);
  return otaTourSchema;
};
