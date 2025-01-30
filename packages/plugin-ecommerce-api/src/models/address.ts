import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  addressSchema,
  IAddress,
  IAddressDocument,
} from './definitions/address';

export interface IAddressModel extends Model<IAddressDocument> {
  getAddressById(_id: string): Promise<IAddressDocument>;
  createAddress(doc: IAddress): Promise<IAddressDocument>;
  updateAddress(_id: string, doc: IAddress): Promise<IAddressDocument>;
  removeAddress(_id: string): Promise<IAddressDocument>;
}

export const loadAddressClass = (models: IModels, subdomain: string) => {
  class Address {
    public static async getAddressById(_id: string) {
      return models.Address.findOne({ _id }).lean();
    }

    public static async createAddress(doc: IAddress) {
      console.log('createAddress', doc);

      const address = await models.Address.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });

      return address;
    }

    public static async updateAddress(_id: string, doc: IAddress) {
      const current = await models.Address.getAddressById(_id);

      if (current) {
        await models.Address.updateOne(
          { _id },
          { $set: { ...doc, modifiedAt: new Date() } },
        );
      }

      return models.Address.findOne({ _id });
    }

    public static async removeAddress(_id: string) {
      return models.Address.findOneAndDelete({ _id });
    }
  }

  addressSchema.loadClass(Address);
  return addressSchema;
};
