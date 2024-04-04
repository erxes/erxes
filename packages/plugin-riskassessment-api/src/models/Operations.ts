import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IOperationsDocument, operationSchema } from './definitions/operations';
export interface IOperationsModel extends Model<IOperationsDocument> {
  addOperation(doc): Promise<IOperationsDocument>;
  updateOperation(_id, doc): Promise<IOperationsDocument>;
  removeOperations(_ids): Promise<IOperationsDocument>;
}

export const loadOperations = (models: IModels, subdomain: string) => {
  class Opearions {
    public static async addOperation(doc) {
      await this.validateOperations(doc);

      if (await models.Operations.findOne({ code: doc.code })) {
        throw new Error('Code must be unique');
      }
      const { parentId, code } = doc;

      const order = await this.generateOrder(parentId, code);

      return models.Operations.create({ ...doc, order });
    }
    public static async updateOperation(_id, doc) {
      const operation = await models.Operations.findOne({ _id });

      if (!operation) {
        throw new Error('Operation not found');
      }
      if (operation.code !== doc.code) {
        if (await models.Operations.findOne({ code: doc.code })) {
          throw new Error('Code must be unique');
        }
      }

      await this.validateOperations(doc);

      doc.order = await this.generateOrder(doc.parseInt, doc.code);

      const childrenOperation = await models.Operations.find({
        order: { $regex: new RegExp(operation.order, 'i') }
      });

      const childOperationIds = childrenOperation.map(
        childOperation => childOperation._id
      );

      if (childOperationIds.includes(doc.parentId)) {
        throw new Error('You cannnot select own ');
      }

      for (const childOperation of childrenOperation) {
        let order = childOperation.order;

        order = order.replace(operation.order, doc.order);

        await models.Operations.updateOne(
          { _id: childOperation._id },
          { $set: { order } }
        );
      }

      return await models.Operations.updateOne(
        { _id },
        { ...doc, modifiedAt: new Date() }
      );
    }
    public static async removeOperations(ids) {
      return models.Operations.deleteMany({ _id: { $in: ids } });
    }
    static async validateOperations(doc) {
      if (!doc) {
        throw new Error('Invalid operation');
      }
      if (!doc.name) {
        throw new Error('You must provide a name');
      }
      if (!doc.code) {
        throw new Error('You must provide a code');
      }
      if (doc.code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }
    }

    static async generateOrder(parentId: string, code: string) {
      const parent = await models.Operations.findOne({ _id: parentId });
      return parent ? `${parent.order}/${code}` : code;
    }
  }

  operationSchema.loadClass(Opearions);
  return operationSchema;
};
