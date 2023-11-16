import { Schema } from 'mongoose';
import { ZmsDictionaries } from '.';
interface IZmsDictionary {
  parentId: string;
  name: string;
  code: string;
  type: string;
  isParent: boolean;
  createdAt: Date;
  createdBy: string;
}

export const zmsDictionarySchema = new Schema<IZmsDictionary>({
  parentId: String,
  name: String,
  code: String,
  type: String,
  isParent: Boolean,
  createdAt: Date,
  createdBy: String
});

export const loadZmsDictionaryClass = () => {
  class ZmsDictionary {
    public static async getZmsDictionary(_id: string) {
      const zmsDictionary = await ZmsDictionaries.findOne({ _id });

      if (!zmsDictionary) {
        throw new Error('Zms not found');
      }

      return zmsDictionarySchema;
    }

    // create
    public static async createZmsDictionary(doc) {
      return ZmsDictionaries.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  zmsDictionarySchema.loadClass(ZmsDictionary);

  return zmsDictionarySchema;
};
