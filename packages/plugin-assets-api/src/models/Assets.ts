import { ICustomField } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { ASSET_STATUSES } from '../common/constant/asset';
import { IAsset, IAssetDocument } from '../common/types/asset';
import { IModels } from '../connectionResolver';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendFormsMessage
} from '../messageBroker';
import { assetSchema } from './definitions/assets';
export interface IAssetModel extends Model<IAssetDocument> {
  getAssets(selector: any): Promise<IAssetDocument>;
  createAsset(doc: IAsset): Promise<IAssetDocument>;
  updateAsset(_id: string, doc: IAsset): Promise<IAssetDocument>;
  removeAssets(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeAssets(assetIds: string[], assetFields: IAsset): Promise<IAssetDocument>;
}

export const loadAssetClass = (models: IModels, subdomain: string) => {
  class Asset {
    public static async getAssets(selector: any) {
      const asset = await models.Assets.findOne(selector);

      if (!asset) {
        throw new Error('Asset not found');
      }

      return asset;
    }
    public static async createAsset(doc: IAsset) {
      if (doc.code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      if (await models.Assets.findOne({ code: doc.code })) {
        throw new Error('Code must be unique');
      }

      if (!doc.parentId && !doc.categoryId) {
        throw new Error('You must choose  category or  parent');
      }

      const parentAsset = await models.Assets.findOne({
        _id: doc.parentId
      }).lean();

      doc.order = await this.generateOrder(parentAsset, doc);

      if (doc.categoryCode) {
        const category = await models.AssetCategories.getAssetCategory({
          code: doc.categoryCode
        });
        doc.categoryId = category._id;
      }

      if (doc.vendorCode) {
        const vendor = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: {
            $or: [
              { code: doc.vendorCode },
              { primaryEmail: doc.vendorCode },
              { primaryPhone: doc.vendorCode },
              { primaryName: doc.vendorCode }
            ]
          },
          isRPC: true
        });

        doc.vendorId = vendor?._id;
      }

      doc.customFieldsData = await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: doc.customFieldsData,
        isRPC: true
      });

      return models.Assets.create(doc);
    }

    public static async updateAsset(_id: string, doc: IAsset) {
      const asset = await models.Assets.getAssets({ _id });

      if (asset.code !== doc.code) {
        if (doc.code.includes('/')) {
          throw new Error('The "/" character is not allowed in the code');
        }

        if (await models.Assets.findOne({ code: doc.code })) {
          throw new Error('Code must be unique');
        }
      }

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await sendFormsMessage({
          subdomain,
          action: 'fields.prepareCustomFieldsData',
          data: doc.customFieldsData,
          isRPC: true
        });
      }

      const parentAsset = await models.Assets.findOne({
        _id: doc.parentId
      }).lean();

      doc.order = await this.generateOrder(parentAsset, doc);

      await models.Assets.updateOne({ _id }, { $set: doc });

      return models.Assets.findOne({ _id });
    }

    public static async removeAssets(_ids: string[]) {
      const dealAssetIds: string[] = [];

      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      for (const id of _ids) {
        if (!dealAssetIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        await models.Assets.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: ASSET_STATUSES.DELETED }
          }
        );
        response = 'updated';
      }

      const assets = await models.Assets.find({ _id: { $in: unUsedIds } });
      const orders = assets.map(asset =>
        asset.order.match(/\\/) ? asset.order : new RegExp(asset.order)
      );

      const child_assets = await models.Assets.find({ order: { $in: orders } });

      const child_assets_ids = child_assets.map(asset => asset._id);

      const movementItems = await models.MovementItems.find({
        assetId: { $in: [...unUsedIds, ...child_assets_ids] }
      });
      const movement_ids = movementItems.map(
        movementItem => movementItem.movementId
      );
      const movement_items_ids = movementItems.map(
        movementItem => movementItem._id
      );

      await models.Movements.deleteMany({
        _id: { $in: [...new Set(movement_ids)] }
      });
      await models.MovementItems.deleteMany({
        _id: { $in: movement_items_ids }
      });

      await models.Assets.deleteMany({ _id: { $in: child_assets_ids } });

      return response;
    }

    public static async mergeAssets(assetIds: string[], assetFields: IAsset) {
      const fields = ['name', 'code', 'unitPrice'];
      const checkParent = [assetFields.parentId, assetFields.categoryId];

      for (const field of fields) {
        if (!assetFields[field]) {
          throw new Error(`Can not merge assets. Must choose ${field} field.`);
        }
      }

      if (!checkParent.find(i => i)) {
        throw new Error(
          `Can not merge assets. Must choose Parent or Category field`
        );
      }

      let customFieldsData: ICustomField[] = [];
      const name: string = assetFields.name || '';
      const description: string = assetFields.description || '';
      const categoryId = assetFields.categoryId || undefined;
      const parentId = assetFields.parentId || undefined;
      const vendorId: string = assetFields.vendorId || '';
      const usedIds: string[] = [];

      for (const assetId of assetIds) {
        const assetObj = await models.Assets.getAssets({ _id: assetId });

        // merge custom fields data
        customFieldsData = [
          ...customFieldsData,
          ...(assetObj.customFieldsData || [])
        ];

        await models.Assets.findByIdAndUpdate(assetId, {
          $set: {
            status: ASSET_STATUSES.DELETED,
            code: Math.random()
              .toString()
              .concat('^', assetObj.code)
          }
        });
      }

      // Creating asset with properties
      const asset = await models.Assets.createAsset({
        ...assetFields,
        customFieldsData,
        mergedIds: assetIds,
        name,
        description,
        categoryId,
        parentId,
        vendorId
      });

      const dealProductIds = await sendCardsMessage({
        subdomain,
        action: 'findDealProductIds',
        data: {
          _ids: assetIds
        },
        isRPC: true
      });

      for (const deal of dealProductIds) {
        if (assetIds.includes(deal)) {
          usedIds.push(deal);
        }
      }

      await sendCardsMessage({
        subdomain,
        action: 'deals.updateMany',
        data: {
          selector: {
            'assetsData.assetId': { $in: usedIds }
          },
          modifier: {
            $set: { 'assetsData.$.assetId': asset._id }
          }
        },
        isRPC: true
      });

      return asset;
    }

    public static async generateOrder(parentAsset: IAsset, doc: IAsset) {
      const order = parentAsset
        ? `${parentAsset.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }

  assetSchema.loadClass(Asset);

  return assetSchema;
};
