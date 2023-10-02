import { sendRequest } from '@erxes/api-utils/src';
import { Model } from 'mongoose';
import {
  dealsAdd as dealsAddMutation,
  dealDetail as dealDetailQuery
} from '../common/dealsGraphql';
import { IModels } from '../connectionResolver';
import { SyncedDealDocuments, syncedDealSchema } from './definitions//deals';
import { ISyncDocument } from './definitions/sync';

export interface ISyncDealModel extends Model<SyncedDealDocuments> {
  addDeal(syncId: any, doc: any): Promise<SyncedDealDocuments>;
  dealDetail(
    sync: ISyncDocument,
    id: string
  ): Promise<{ _id: string; name: string; stageId: string; stage: any }>;
}

export const loadSyncDealClass = (models: IModels, subdomain: string) => {
  class Deal {
    public static async addDeal(syncId, doc) {
      const sync = await models.Sync.findOne({ _id: syncId });

      if (!sync) {
        throw new Error('Not found sync');
      }

      const variables = { ...doc };

      if (!doc?.stageId) {
        const { config } = sync;
        variables.stageId = config?.stageId;
      }

      const { data, errors } = await sendRequest({
        url: `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'erxes-app-token': sync.appToken
        },
        body: {
          query: dealsAddMutation,
          variables
        }
      });

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const { dealsAdd } = data;
      const { customerIds } = doc;

      if (!dealsAdd) {
        throw new Error('Something went wrong');
      }

      await models.SyncedDeals.insertMany(
        customerIds.map(customerId => ({
          syncedCustomerId: customerId,
          dealId: dealsAdd._id,
          syncId: sync._id
        }))
      );
      return dealsAdd;
    }

    public static async dealDetail(sync: ISyncDocument, id: string) {
      const { data, errors } = await sendRequest({
        url: `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'erxes-app-token': sync.appToken
        },
        body: {
          query: dealDetailQuery,
          variables: { id }
        }
      });

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const { dealDetail } = data || {};

      return dealDetail;
    }
  }

  syncedDealSchema.loadClass(Deal);

  return syncedDealSchema;
};
