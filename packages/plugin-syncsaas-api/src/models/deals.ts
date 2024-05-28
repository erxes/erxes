import fetch from 'node-fetch';
import { Model } from 'mongoose';
import {
  dealsAdd as dealsAddMutation,
  dealDetail as dealDetailQuery,
} from '../common/dealsGraphql';
import { IModels } from '../connectionResolver';
import { SyncedDealDocuments, syncedDealSchema } from './definitions//deals';
import { ISyncDocument } from './definitions/sync';

const generateSyncedDealsDocs = ({
  syncId,
  dealId,
  customerIds,
  companyIds,
}) => {
  const contactIds = customerIds || companyIds || [];

  let comtactType = '';
  if (customerIds) {
    comtactType = 'customer';
  }
  if (companyIds) {
    comtactType = 'company';
  }

  if (!comtactType) {
    return [];
  }

  return contactIds.map((contactId) => ({
    syncedContactTypeId: contactId,
    syncedContactType: comtactType,
    dealId,
    syncId,
  }));
};

export interface ISyncDealModel extends Model<SyncedDealDocuments> {
  addDeal(syncId: any, doc: any): Promise<SyncedDealDocuments>;
  dealDetail(
    sync: ISyncDocument,
    id: string,
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

      const { data, errors } = await fetch(
        `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'erxes-app-token': sync.appToken,
          },
          body: JSON.stringify({
            query: dealsAddMutation,
            variables,
          }),
        },
      ).then((res) => res.json());

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const { dealsAdd } = data;
      const { customerIds, companyIds } = doc;

      if (!dealsAdd) {
        throw new Error('Something went wrong');
      }

      await models.SyncedDeals.insertMany(
        generateSyncedDealsDocs({
          syncId: sync._id,
          dealId: dealsAdd._id,
          customerIds,
          companyIds,
        }),
      );
      return dealsAdd;
    }

    public static async dealDetail(sync: ISyncDocument, id: string) {
      const { data, errors } = await fetch(
        `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'erxes-app-token': sync.appToken,
          },
          body: JSON.stringify({
            query: dealDetailQuery,
            variables: { id },
          }),
        },
      ).then((res) => res.json());

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
