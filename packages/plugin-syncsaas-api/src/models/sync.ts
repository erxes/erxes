import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import {
  companiesAdd as companiesAddMutation,
  companiesQuery,
  companyDetail as companyDetailQuery,
} from '../common/companyQueries';
import { CONTACT_STATUSES } from '../common/constants';
import {
  customersAdd as customerAddMutation,
  customerDetail as customerDetailQuery,
  customersQuery,
} from '../common/customerQueries';
import { IModels } from '../connectionResolver';
import { sendContactsMessage } from '../messageBroker';
import {
  ISyncDocument,
  ISyncedContactsDocument,
  syncSaasSchema,
} from './definitions/sync';
import {
  fetchDataFromSaas,
  getCompanyDoc,
  getCustomerDoc,
  validateDoc,
} from './utils';

export interface ISyncModel extends Model<ISyncDocument> {
  addSync(doc: any, user: any): Promise<ISyncDocument>;
  editSync(_id: string, doc: any): Promise<ISyncDocument>;
  removeSync(_id: string): Promise<ISyncDocument>;
  getSyncedSaas({ subdomain, customerId }): Promise<any>;
  getCustomerDoc(customer: any): Promise<any>;
  searchContactFromSaas(
    syncId: string,
    email: string,
    contactType: string,
  ): Promise<any>;
  syncSaasContact(params: any): Promise<ISyncedContactsDocument>;
}

export const loadSyncClass = (models: IModels, mainSubdomain: string) => {
  class Sync {
    public static async addSync(doc: any, user: IUserDocument) {
      try {
        validateDoc(doc);
      } catch (error) {
        throw new Error(error.message);
      }

      const { SAAS_CORE_URL } = process.env;

      await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
        headers: {
          origin: `${doc.subdomain}..app.erxes.io`,
        },
      });

      const extendedDoc = {
        ...doc,
        createdUserId: user._id,
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
        await fetch(`${SAAS_CORE_URL}/check-subdomain`, {
          headers: {
            origin: `${doc.subdomain}..app.erxes.io`,
          },
        });
      }
      return await models.Sync.updateOne({ _id }, { $set: doc });
    }

    public static async removeSync(_id) {
      const sync = await models.Sync.findOne({ _id });

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      await models.SyncedContacts.deleteMany({ syncId: _id });

      return await models.Sync.findByIdAndDelete(_id);
    }

    public static async getSyncedSaas({ subdomain, customerId, companyId }) {
      const sync = await models.Sync.findOne({ subdomain }).lean();

      if (!sync) {
        throw new Error('Cannot find sync');
      }

      if (sync.expireDate <= new Date().toString()) {
        throw new Error('This sync expired');
      }

      if (customerId && companyId) {
        throw new Error('Please provide a companyId or customerId');
      }

      let selector;

      if (customerId) {
        selector = { contactType: 'customer', contactTypeId: customerId };
      }

      if (companyId) {
        selector = { contactType: 'company', contactTypeId: companyId };
      }

      return this.syncContact(sync, selector);
    }

    static async syncContact(sync, selector) {
      const { contactType, contactTypeId } = selector;

      const syncedContact = await models.SyncedContacts.findOne({
        syncId: sync._id,
        ...selector,
      });

      const isContactExistsSaas = await this.checkSaasContact({
        sync,
        syncedContact,
        contactType,
      });

      const isApproved = !!sync?.checkApproved
        ? syncedContact?.status === CONTACT_STATUSES.APPROVED
        : true;

      if (isContactExistsSaas && isApproved) {
        sync.contactTypeId = contactTypeId;

        return sync;
      }

      if (
        isContactExistsSaas &&
        syncedContact?.status === CONTACT_STATUSES.WAITING
      ) {
        throw new Error('Customer not approved in synced saas');
      }

      let action: string = '';
      if (contactType === 'company') {
        action = 'companies.findOne';
      }
      if (contactType === 'customer') {
        action = 'customers.findOne';
      }

      const contact = await sendContactsMessage({
        subdomain: mainSubdomain,
        action,
        data: { _id: contactTypeId },
        isRPC: true,
        defaultValue: null,
      });

      if (!contact) {
        throw new Error('Cannot find contact');
      }

      await this.createContactToSaas({ sync, contact, contactType });

      if (!!sync?.checkApproved) {
        return {
          subdomain: sync.subdomain,
          contactType,
          contactTypeId: contact._id,
        };
      }

      sync.contactTypeId = contact._id;
      return sync;
    }

    static async createContactToSaas({ sync, contact, contactType }) {
      let data: any = {
        subdomain: sync.subdomain,
        appToken: sync.appToken,
      };

      if (contactType === 'customer') {
        data = {
          ...data,
          query: customerAddMutation,
          variables: { ...(await getCustomerDoc(contact)) },
          name: 'customersAdd',
        };
      }

      if (contactType === 'company') {
        data = {
          ...data,
          query: companiesAddMutation,
          variables: { ...(await getCompanyDoc(contact)) },
          name: 'companiesAdd',
        };
      }

      const newContact = await fetchDataFromSaas(data);

      if (!newContact) {
        throw new Error('Error occurred while creating contact to saas');
      }

      await models.SyncedContacts.create({
        syncId: sync._id,
        contactType,
        contactTypeId: contact._id,
        syncedContactTypeId: newContact._id,
        status: !!sync?.checkApproved ? CONTACT_STATUSES.WAITING : undefined,
      });
    }

    static async checkSaasContact({ sync, syncedContact, contactType }) {
      const { subdomain, appToken } = sync;

      if (!syncedContact?.syncedContactTypeId) {
        return false;
      }

      const data: any = {
        variables: { _id: syncedContact?.syncedContactTypeId },
      };

      if (contactType === 'customer') {
        data.query = customerDetailQuery;
        data.name = 'customerDetail';
      }

      if (contactType === 'company') {
        data.query = companyDetailQuery;
        data.name = 'companyDetail';
      }

      const contactDetail = await fetchDataFromSaas({
        subdomain,
        appToken,
        ...data,
      });

      return !!contactDetail;
    }

    public static async searchContactFromSaas(
      syncId: string,
      email: string,
      contactType: string,
    ) {
      const sync = await models.Sync.findOne({ _id: syncId });

      if (!sync) {
        throw new Error('Not found sync');
      }

      let data: any = {};

      if (contactType === 'customer') {
        data = { query: customersQuery, name: 'customers' };
      }
      if (contactType === 'company') {
        data = { query: companiesQuery, name: 'companies' };
      }

      const contacts = await fetchDataFromSaas({
        subdomain: sync.subdomain,
        appToken: sync.appToken,
        ...data,
        variables: { searchValue: email },
      });

      return contacts;
    }

    public static async syncSaasContact(params) {
      const { syncId, contactTypeId, contactType, syncContactId } = params;

      let action: string = '';

      if (contactType === 'customer') {
        action = 'customers.findOne';
      }

      if (contactType === 'company') {
        action = 'companies.findOne';
      }

      if (!action) {
        throw new Error('Unsupported contact type');
      }

      const contact = await sendContactsMessage({
        subdomain: mainSubdomain,
        action,
        data: {
          _id: contactTypeId,
        },
        isRPC: true,
        defaultValue: null,
      });

      if (!contact) {
        throw new Error('Not found contact');
      }

      const syncedContacts = await models.SyncedContacts.create({
        syncId,
        contactType,
        contactTypeId: contact._id,
        syncedContactTypeId: syncContactId,
      });

      return syncedContacts;
    }
  }

  syncSaasSchema.loadClass(Sync);

  return syncSaasSchema;
};
