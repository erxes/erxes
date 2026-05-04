import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IPosSlotDocument, IProductGroupDocument } from '../../@types/orders';
import { IPos, IPosDocument } from '../../@types/pos';
import { posSchema, posSlotSchema, productGroupSchema } from '../definitions/pos';

export interface IPosModel extends Model<IPosDocument> {
  getPosList(query: any): Promise<IPosDocument>;
  getPos(query: any): Promise<IPosDocument>;
  posAdd(user, doc: IPos): Promise<IPosDocument>;
  posEdit(_id: string, doc: IPos): Promise<IPosDocument>;
  posRemove(_id: string): Promise<IPosDocument>;
}

export const loadPosClass = (models: IModels, _subdomain: string, { sendDbEventLog }: EventDispatcherReturn) => {
  class Pos {
    public static async getPosList(query: any) {
      return models.Pos.find(query).sort({ createdAt: 1 });
    }

    public static async getPos(query: any) {
      const pos = await models.Pos.findOne(query).lean();

      if (!pos) {
        throw new Error('POS not found');
      }
      return pos;
    }

    public static generateToken(length = 32) {
      const a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split(
        ''
      );
      const b = [] as any;

      for (let i = 0; i < length; i++) {
        const j = (Math.random() * (a.length - 1)).toFixed(0);

        b[i] = a[j];
      }

      return b.join('');
    }

    public static async posAdd(user, doc: IPos) {
      try {
        const pos = await models.Pos.create({
          ...doc,
          userId: user._id,
          createdAt: new Date(),
          token: this.generateToken()
        });
        sendDbEventLog({
          action: 'create',
          docId: pos._id,
          currentDocument: pos.toObject()
        });
        return pos
      } catch (e) {
        throw new Error(
          `Can not create POS integration. Error message: ${e.message}`
        );
      }
    }

    public static async posEdit(_id: string, doc: IPos) {
      const oldPos = await models.Pos.getPos({ _id });

      await models.Pos.updateOne(
        { _id },
        { $set: { ...doc } },
        { runValidators: true }
      );

      const updatedPos = await models.Pos.findOne({ _id }).lean();

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: { ...updatedPos },
        prevDocument: oldPos,
      });

      return updatedPos;
    }

    public static async posRemove(_id: string) {
      const pos = await models.Pos.getPos({ _id });

      if (await models.PosOrders.findOne({ posToken: pos.token })) {
        throw new Error('This pos used in orders');
      }

      await models.ProductGroups.deleteMany({ posId: pos._id });
      await models.PosSlots.deleteMany({ posId: pos._id });
      let result;

      if (!pos.onServer) {
        result = await models.Pos.updateOne({ _id }, { $set: { status: 'deleted' } });
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: { status: 'deleted' },
          prevDocument: pos,
        });
      } else {
        result = await models.Pos.deleteOne({ _id });
        sendDbEventLog({
          action: 'delete',
          docId: _id,
        });
      }
      return result;
    }
  }

  posSchema.loadClass(Pos);

  return posSchema;
};

export interface IProductGroupModel extends Model<IProductGroupDocument> {
  groups(posId: string): Promise<IProductGroupDocument[]>;
  groupsAdd(user, name, description): Promise<IProductGroupDocument>;
  groupsEdit(_id, doc): Promise<IProductGroupDocument>;
  groupsRemove(_id: string): Promise<IProductGroupDocument>;
}

export const loadProductGroupClass = (models, _subdomain) => {
  class ProductGroup {
    public static async groups(posId: string) {
      return models.ProductGroups.find({ posId }).lean();
    }

    public static async groupsAdd(user, name, description) {
      return models.ProductGroups.create({
        userId: user._id,
        name,
        description,
        createdAt: new Date()
      });
    }

    public static async groupsEdit(_id, doc) {
      const group = await models.ProductGroups.findOne({ _id }).lean();

      if (!group) {
        throw new Error('group not found');
      }

      await models.ProductGroups.updateOne(
        { _id },
        {
          $set: { ...doc }
        }
      );

      return await models.ProductGroups.findOne({ _id }).lean();
    }

    public static async groupsRemove(_id: string) {
      return models.ProductGroups.deleteOne({ _id });
    }
  }

  productGroupSchema.loadClass(ProductGroup);

  return productGroupSchema;
};

export type IPosSlotModel = Model<IPosSlotDocument>

export const loadPosSlotClass = (models: IModels, _subdomain) => {
  class PosSlot { }

  posSlotSchema.loadClass(PosSlot);

  return posSlotSchema;
};
