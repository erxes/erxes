import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';
import { field } from '@erxes/api-utils/src/definitions/utils';
import { sendCoreMessage } from '../messageBroker';

export interface IExm {
  name: string;
}

export interface IExmDocument extends IExm, Document {
  _id: string;
}
export interface ICategory {
  name: string;
  parentId: string;
  description: string;
  code: string;
  order: string;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: string;
}

const featureSchema = new Schema({
  _id: { type: String },
  icon: { type: String },
  name: { type: String },
  description: { type: String },
  contentType: { type: String },
  contentId: { type: String },
  subContentId: { type: String }
});

const appearanceSchema = new Schema(
  {
    primaryColor: { type: String },
    secondaryColor: { type: String },
    bodyColor: { type: String },
    headerColor: { type: String },
    footerColor: { type: String }
  },
  { _id: false }
);

const scoringConfigSchema = new Schema(
  {
    action: { type: String },
    score: { type: String }
  },
  { _id: false }
);

// Mongoose schemas =======================

export const exmSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String, label: 'Name' },
  webName: { type: String, label: 'Web Name' },
  webDescription: { type: String, label: 'Web Description' },
  url: { type: String, label: 'Url' },
  description: { type: String, label: 'Description' },
  categoryId: field({ type: String }),
  features: { type: [featureSchema] },
  logo: { type: Object },
  favicon: { type: Object },
  vision: { type: Object },
  structure: { type: Object },
  appearance: { type: appearanceSchema },
  scoringConfig: { type: [scoringConfigSchema] },
  createdBy: { type: String, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' }
});

export const exmCategorySchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  parentId: field({ type: String }),
  description: field({ type: String, label: 'Description', optional: true }),
  code: field({ type: String, label: 'Code' }),
  order: field({ type: String, label: 'Order' }),
  createdAt: { type: Date, label: 'Created at' }
});

export interface IExmModel extends Model<IExmDocument> {
  getExm(_id: string): IExmDocument;
  createExm(doc: IExm, user: any): IExmDocument;
  updateExm(_id: string, doc: IExm): IExmDocument;
  removeExm(_id: string): IExmDocument;
  useScoring(user: any, action: string): IExmDocument;
}

export interface IExmCategoryModel extends Model<ICategoryDocument> {
  getExmCategory(_id: string): ICategoryDocument;
  createExmCategory(doc: any): ICategoryDocument;
  updateExmCategory(_id: string, doc: any): ICategoryDocument;
  removeExmCategory(_id: string): IExmDocument;
}

const validateDoc = async (models: IModels, doc: ICategory) => {
  if (await models.ExmCategories.findOne({ name: doc.name })) {
    throw new Error('Category already exists');
  }

  if (!doc.code) {
    throw new Error('please provide a code');
  }
};

export const loadExmClass = (models: IModels, subdomain: string) => {
  class Exm {
    public static async getExm(_id: string) {
      const exm = await models.Exms.findOne({ _id });

      if (!exm) {
        throw new Error('Exm not found');
      }

      return exm;
    }

    public static async createExm(doc: IExm, user: any) {
      const exm = await models.Exms.create({
        createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });

      return exm;
    }

    /*
     * Update exm
     */
    public static async updateExm(_id: string, doc: IExm) {
      await models.Exms.updateOne({ _id }, { $set: doc });

      return models.Exms.findOne({ _id });
    }

    /*
     * Remove exm
     */
    public static async removeExm(_id: string) {
      const exmObj = await models.Exms.getExm(_id);

      return exmObj.remove();
    }

    public static async useScoring(user, action) {
      const exmObj = await models.Exms.findOne().lean();

      const scoringConfig = (exmObj.scoringConfig || []).find(
        config => config.action === action
      ) || { score: 0 };

      const score = scoringConfig.score || 0;

      await sendCoreMessage({
        subdomain,
        action: 'users.updateOne',
        data: {
          selector: {
            _id: user._id
          },
          modifier: {
            $inc: { score }
          }
        },
        isRPC: true
      });

      return score;
    }
  }

  exmSchema.loadClass(Exm);

  return exmSchema;
};

export const loadExmCategoryClass = (models: IModels, subdomain: string) => {
  class ExmCategory {
    public static async createExmCategory(doc: ICategory) {
      try {
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const parentCategory = await models.ExmCategories.findOne({
        _id: doc.parentId
      }).lean();

      return await models.ExmCategories.create({
        ...doc,
        order: parentCategory
          ? `${parentCategory.order}/${doc.code}`
          : `${doc.code}`,
        createdAt: new Date()
      });
    }

    public static async updateExmCategory(
      _id: string,
      doc: { _id: string } & ICategory
    ) {
      const category = await models.ExmCategories.findOne({
        _id: doc._id
      });

      if (!category) {
        throw new Error('Category not found');
      }

      try {
        await validateDoc(models, doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const parent = await models.ExmCategories.findOne({
        _id: doc.parentId
      });

      doc.order = parent ? `${parent.order}${doc.code}/` : `${doc.code}/`;

      const children = await models.ExmCategories.find({
        order: { $regex: new RegExp(category.order, 'i') }
      });

      for (const child of children) {
        let order = child.order;

        await models.ExmCategories.updateOne(
          {
            _id: child._id
          },
          {
            $set: { order: order.replace(category.order, doc.order) }
          }
        );
      }

      return await models.ExmCategories.updateOne(
        { _id: doc._id },
        { $set: { ...doc } }
      );
    }
    public static async removeExmCategory(_id: string) {
      const category = await models.ExmCategories.findOne({ _id });

      if (!category) {
        throw new Error('Category not found');
      }

      await models.Exms.updateMany(
        { categoryId: category?._id },
        { $set: { categoryId: null } }
      );

      return await models.ExmCategories.deleteMany({
        order: { $regex: new RegExp(category.order, 'i') }
      });
    }
  }
  exmCategorySchema.loadClass(ExmCategory);

  return exmCategorySchema;
};
