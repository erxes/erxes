import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IOTARoomType, IOTARoomTypeDocument } from '@/ota/@types/roomTypes';
import { otaRoomTypeSchema } from '@/ota/db/definitions/roomTypes';

export interface IRoomTypeModel extends Model<IOTARoomTypeDocument> {
  createRoomType: (data: IOTARoomType) => Promise<IOTARoomTypeDocument>;
  updateRoomType: (
    id: string,
    data: Partial<IOTARoomType>,
  ) => Promise<IOTARoomTypeDocument | null>;
  deleteRoomType: (id: string) => Promise<IOTARoomTypeDocument | null>;
}

export const loadRoomTypeClass = (models: IModels) => {
  class RoomTypes {
    public static createRoomType = async (data: IOTARoomType) => {
      return models.RoomTypes.create(data);
    };

    public static updateRoomType = async (
      _id: string,
      data: Partial<IOTARoomType>,
    ) => {
      return models.RoomTypes.findOneAndUpdate(
        { _id },
        { $set: data },
        { new: true },
      );
    };

    public static deleteRoomType = async (_id: string) => {
      return models.RoomTypes.findOneAndDelete({ _id });
    };
  }

  otaRoomTypeSchema.loadClass(RoomTypes);
  return otaRoomTypeSchema;
};
