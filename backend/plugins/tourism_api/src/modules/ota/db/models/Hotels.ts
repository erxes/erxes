import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { IOTAHotel, IOTAHotelDocument } from '@/ota/@types/hotels';
import { otaHotelSchema } from '@/ota/db/definitions/hotels';

export interface IHotelModel extends Model<IOTAHotelDocument> {
  getHotels: (query: any) => Promise<IOTAHotelDocument[]>;
  createHotel: (data: IOTAHotel) => Promise<IOTAHotelDocument>;
  updateHotel: (id: string, data: IOTAHotel) => Promise<IOTAHotelDocument>;
  deleteHotel: (id: string) => Promise<IOTAHotelDocument>;
  togglePublish: (id: string) => Promise<IOTAHotelDocument>;
}

export const loadHotelClass = (models: IModels) => {
  class Hotels {
    public static createHotel = async (data: IOTAHotel) => {
      return models.Hotels.create(data);
    };

    public static updateHotel = async (_id: string, data: IOTAHotel) => {
      const hotel = await models.Hotels.findOneAndUpdate(
        { _id },
        { $set: data },
      );
      return hotel;
    };

    public static deleteHotel = async (_id: string) => {
      const hotel = await models.Hotels.findOneAndDelete({ _id });
      return hotel;
    };

    public static getHotels = async (query: any) => {
      return models.Hotels.find(query).lean();
    };

    public static togglePublish = async (_id: string) => {
      const hotel = await models.Hotels.findOne({ _id }).lean();
      if (!hotel) {
        throw new Error('Hotel not found');
      }

      hotel.isPublished = hotel.isPublished ? false : true;
      const updatedHotel = await models.Hotels.findOneAndUpdate(
        { _id },
        { $set: hotel },
      );
      return updatedHotel;
    };
  }
  otaHotelSchema.loadClass(Hotels);

  return otaHotelSchema;
};
