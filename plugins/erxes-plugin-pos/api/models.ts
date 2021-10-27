import { IPOS } from './types';
import * as Random from 'meteor-random';
/**
 * pos
 */

export const posSChema = {
  _id: { pkey: true },
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  userId: { type: String, optional: true, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' },
  integrationId: { type: String, label: 'Integration id' },
  productDetails: { type: [String], label: 'Product fields' },
  adminIds: { type: [String], label: 'Admin user ids' },
  cashierIds: { type: [String], label: 'Cashier ids' },
  waitingScreen: { type: Object, label: 'Waiting screen config' },
  kioskMachine: { type: Object, label: 'Kiosk config' },
  kitchenScreen: { type: Object, label: 'Kitchen screen config' },
  uiOptions: { type: Object, label: 'UI Options' },
  formSectionTitle: { type: String, label: 'Form section title' },
  formIntegrationIds: { type: [String], label: 'Form integration ids' },
  token: { type: String, label: 'Pos token' }
};

class Pos {
  public static async getPosList(models, query: any) {
    return models.Pos.find(query).sort({ createdAt: 1 });
  }

  public static async getPos(models, query: any) {
    const pos = await models.Pos.findOne(query).lean();

    if (!pos) {
      throw new Error('POS not found');
    }
    return pos;
  }

  public static async generateToken(models, code?: string) {
    let generatedCode = code || Random.id().substr(0, 10);

    let prevPos = await models.Pos.findOne({ token: generatedCode });

    // search until not existing one found
    while (prevPos) {
      generatedCode = Random.id().substr(0, 10);

      prevPos = await models.Pos.findOne({ token: generatedCode });
    }

    return generatedCode;
  }

  public static async posAdd(models, user, doc: IPOS) {
    try {
      const integration = await models.Integrations.createIntegration(
        { ...doc, kind: 'pos', isActive: true },
        user._id
      );

      return models.Pos.create({
        userId: user._id,
        integrationId: integration._id,
        createdAt: new Date(),
        token: await this.generateToken(models),
        ...doc
      });
    } catch (e) {
      throw new Error(
        `Can not create POS integration. Error message: ${e.message}`
      );
    }
  }

  public static async posEdit(models, _id: string, doc: IPOS) {
    const pos = await models.Pos.getPos(models, { _id });

    await models.Pos.updateOne({ _id }, { $set: doc }, { runValidators: true });

    await models.Integrations.updateOne(
      { _id: pos.integrationId },
      { $set: doc },
      { runValidators: true }
    );

    return await models.Pos.findOne({ _id }).lean();
  }

  public static async posRemove(models, _id: string) {
    const pos = await models.Pos.getPos(models, { _id });

    await models.Integrations.removeIntegration(pos.integrationId);

    await models.ProductGroups.remove({ posId: pos._id });

    return models.Pos.deleteOne({ _id });
  }
}

/**
 * productGroups
 */

export const productGroupSchema: any = {
  _id: { pkey: true },
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  posId: { type: String, label: 'Pos id' },
  categoryIds: { type: [String], optional: true, label: 'Category ids' },
  excludedCategoryIds: {
    type: [String],
    optional: true,
    label: 'Exclude Category ids'
  },
  excludedProductIds: {
    type: [String],
    optional: true,
    label: 'Exclude Product ids'
  }
};

class ProductGroup {
  public static async groups(models, posId: string) {
    return models.ProductGroups.find({ posId }).lean();
  }

  public static async groupsAdd(models, user, name, description) {
    return models.ProductGroups.create({
      userId: user._id,
      name,
      description,
      createdAt: new Date()
    });
  }

  public static async groupsEdit(models, _id, doc) {
    const group = await models.ProductGroups.findOne({ _id }).lean();

    if (!group) {
      throw new Error('group not found');
    }

    await models.ProductGroups.updateOne(
      { _id },
      {
        $set: doc
      }
    );

    return await models.ProductGroups.findOne({ _id }).lean();
  }

  public static async groupsRemove(models, _id: string) {
    return models.ProductGroups.deleteOne({ _id });
  }
}

export default [
  {
    name: 'Pos',
    schema: posSChema,
    klass: Pos
  },
  {
    name: 'ProductGroups',
    schema: productGroupSchema,
    klass: ProductGroup
  }
];
