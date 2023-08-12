import * as _ from 'underscore';
import { model } from 'mongoose';
import { Schema } from 'mongoose';

export const typeSchema = new Schema({
  name: String
});

export const callsSchema = new Schema({
  name: String,
  createdAt: Date,
  expiryDate: Date,
  checked: Boolean,
  typeId: String
});

export const integrationSchema: Schema<any> = new Schema({
  inboxId: String,
  username: String,
  password: String,
  wsServer: String,
  phone: String,
  operatorIds: [String],
  token: String
});

export const loadIntegrationClass = () => {
  class Integration {}
  integrationSchema.loadClass(Integration);
  return integrationSchema;
};

export const Integrations = model<any, any>(
  'calls_integrations',
  loadIntegrationClass()
);

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

export const loadCallsClass = () => {
  class Calls {
    public static async getCalls(_id: string) {
      const calls = await Callss.findOne({ _id });

      if (!calls) {
        throw new Error('Calls not found');
      }

      return calls;
    }

    // create
    public static async createCalls(doc) {
      return Callss.create({
        ...doc,
        createdAt: new Date()
      });
    }
    // update
    public static async updateCalls(_id: string, doc) {
      await Callss.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removeCalls(_id: string) {
      return Callss.deleteOne({ _id });
    }
  }

  callsSchema.loadClass(Calls);

  return callsSchema;
};

loadCallsClass();
loadTypeClass();

// tslint:disable-next-line
export const Types = model<any, any>('calls_types', typeSchema);

// tslint:disable-next-line
export const Callss = model<any, any>('callss', callsSchema);
