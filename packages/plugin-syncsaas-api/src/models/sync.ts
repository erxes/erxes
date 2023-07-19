import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { ISyncDocument, syncedSaasSchema } from './definitions/sync';
import { validateDoc } from './utils';
import { sendContactsMessage } from '../messageBroker';
import { sendRequest } from '@erxes/api-utils/src';
import {
  customersAdd as customersAddQueries,
  customerDetail as customerDetailQuery
} from '../common/customerQueries';

export interface ISyncModel extends Model<ISyncDocument> {
  addSync(doc: any, user: any): Promise<ISyncDocument>;
  editSync(_id: string, doc: any): Promise<ISyncDocument>;
  removeSync(_id: string): Promise<ISyncDocument>;
  getSyncedSaas(
    { subdomain, customerId },
    mainSubDomain
  ): Promise<ISyncDocument>;
}

export const loadSyncClass = (models: IModels, subdomain: string) => {
  class Sync {
    public static async addSync(doc: any, user: IUserDocument) {
      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { SAAS_CORE_URL } = process.env;

      await sendRequest({
        url: `${SAAS_CORE_URL}/check-subdomain`,
        method: 'GET',
        headers: {
          origin: `${doc.subdomain}..app.erxes.io`
        }
      });

      const extendedDoc = {
        ...doc,
        createdUserId: user._id
      };

      return await models.Sync.create({ ...extendedDoc });
    }

    public static async editSync(_id, doc) {
      const { SAAS_CORE_URL } = process.env;

      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const sync = await models.Sync.findOne({ _id });

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      if (sync.subdomain !== doc.subdomain) {
        await sendRequest({
          url: `${SAAS_CORE_URL}/check-subdomain`,
          method: 'GET',
          headers: {
            origin: `${doc.subdomain}..app.erxes.io`
          }
        });
      }
      return await models.Sync.updateOne({ _id }, { $set: doc });
    }

    public static async removeSync(_id) {
      return await models.Sync.findByIdAndDelete(_id);
    }

    public static async getSyncedSaas(
      { subdomain, customerId },
      mainSubDomain
    ) {
      const sync = await models.Sync.findOne({ subdomain });

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      if (sync.expireDate <= new Date().toString()) {
        throw new Error('This sync expired');
      }

      if (
        sync?.customerIds?.includes(customerId) &&
        (await this.checkSaasCustomer(
          sync.subdomain,
          sync.appToken,
          customerId
        ))
      ) {
        return sync;
      }

      const customer = await sendContactsMessage({
        subdomain: mainSubDomain,
        action: 'customers.findOne',
        data: { _id: customerId },
        isRPC: true,
        defaultValue: null
      });

      if (!customer) {
        throw new Error('Cannot find customer');
      }

      let customerDoc = {};

      for (const key of Object.keys(customer)) {
        if (
          [
            'state',
            'sex',
            'emails',
            'emailValidationStatus',
            'phones',
            'phoneValidationStatus',
            'status',
            'hasAuthority',
            'doNotDisturb',
            'isSubscribed',
            'relatedIntegrationIds',
            'deviceTokens'
          ]
        ) {
          customerDoc[key] = customer[key];
        }
      }

      const { data, errors } = await sendRequest({
        url: `https://${sync.subdomain}.app.erxes.io/gateway/graphql`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'erxes-app-token': sync.appToken
        },
        body: {
          query: customersAddQueries,
          variables: { ...customer }
        }
      });

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const newCustomer = data?.customersAdd ? data?.customersAdd : null;

      if (!newCustomer) {
        throw new Error('Somthing went wrong');
      }

      await models.Sync.updateOne(
        { _id: sync._id },
        { $addToSet: { customerIds: customer._id } }
      );
      return await models.Sync.findOne({ _id: sync._id });
    }

    public static async getCustomerDoc(customer) {
      let customerDoc = {};

      for (const key of Object.keys(customer)) {
        if (
          [
            'state',
            'sex',
            'emails',
            'emailValidationStatus',
            'phones',
            'phoneValidationStatus',
            'status',
            'hasAuthority',
            'doNotDisturb',
            'isSubscribed',
            'relatedIntegrationIds',
            'deviceTokens'
          ]
        ) {
          customerDoc[key] = customer[key];
        }
      }

      return customerDoc;
    }

    public static async checkSaasCustomer(subdomain, appToken, customerId) {
      const { data, errors } = await sendRequest({
        url: `https://${subdomain}.app.erxes.io/gateway/graphql`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'erxes-app-token': appToken
        },
        body: {
          query: customerDetailQuery,
          variables: { _id: customerId }
        }
      });

      if (errors) {
        throw new Error(errors[0]?.message);
      }

      const { customerDetail } = data;

      return !!customerDetail;
    }
  }

  syncedSaasSchema.loadClass(Sync);

  return syncedSaasSchema;
};
