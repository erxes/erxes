import { Model } from 'mongoose';
import { putActivityLog, prepareCocLogData } from '../logUtils';
import { validSearchText } from '@erxes/api-utils/src';
import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import {
  companySchema,
  ICompany,
  ICompanyDocument
} from './definitions/companies';
import { ACTIVITY_CONTENT_TYPES } from './definitions/constants';
import { IModels } from '../connectionResolver';
import {
  sendCoreMessage,
  sendFormsMessage,
  sendInternalNotesMessage
} from '../messageBroker';

export interface ICompanyModel extends Model<ICompanyDocument> {
  getCompanyName(company: ICompany): string;

  checkDuplication(
    companyFields: {
      primaryName?: string;
      code?: string;
    },
    idsToExclude?: string[] | string
  ): never;

  fillSearchText(doc: ICompany): string;

  findActiveCompanies(selector, fields?): Promise<ICompanyDocument[]>;
  getCompany(_id: string): Promise<ICompanyDocument>;

  // createCompany(doc: ICompany, user?: IUserDocument): Promise<ICompanyDocument>;
  createCompany(doc: ICompany, user?: any): Promise<ICompanyDocument>;

  updateCompany(_id: string, doc: ICompany): Promise<ICompanyDocument>;

  removeCompanies(_ids: string[]): Promise<{ n: number; ok: number }>;

  mergeCompanies(
    companyIds: string[],
    companyFields: ICompany
  ): Promise<ICompanyDocument>;

  bulkInsert(
    fieldNames: string[],
    fieldValues: string[][],
    user: any
  ): Promise<string[]>;
}

export const loadCompanyClass = (models: IModels, subdomain) => {
  class Company {
    /**
     * Checking if company has duplicated unique properties
     */
    public static async checkDuplication(
      companyFields: {
        primaryName?: string;
        code?: string;
      },
      idsToExclude?: string[] | string
    ) {
      const query: { status: {}; [key: string]: any } = {
        status: { $ne: 'deleted' }
      };
      let previousEntry;

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id = { $nin: idsToExclude };
      }

      if (!companyFields) {
        return;
      }

      if (companyFields.primaryName) {
        // check duplication from primaryName
        previousEntry = await models.Companies.find({
          ...query,
          primaryName: companyFields.primaryName
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated name');
        }
      }

      if (companyFields.code) {
        // check duplication from code
        previousEntry = await models.Companies.find({
          ...query,
          code: companyFields.code
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated code');
        }
      }
    }

    public static fillSearchText(doc: ICompany) {
      return validSearchText([
        (doc.names || []).join(' '),
        (doc.emails || []).join(' '),
        (doc.phones || []).join(' '),
        doc.website || '',
        doc.industry || '',
        doc.plan || '',
        doc.description || '',
        doc.code || ''
      ]);
    }

    public static getCompanyName(company: ICompany) {
      return (
        company.primaryName ||
        company.primaryEmail ||
        company.primaryPhone ||
        'Unknown'
      );
    }

    public static companyFieldNames() {
      const names: string[] = [];

      companySchema.eachPath(name => {
        names.push(name);

        const path = companySchema.paths[name];

        if (path.schema) {
          path.schema.eachPath(subName => {
            names.push(`${name}.${subName}`);
          });
        }
      });

      return names;
    }

    public static fixListFields(
      doc: any,
      trackedData: any[] = [],
      company?: ICompanyDocument
    ) {
      let emails: string[] = doc.emails || [];
      let phones: string[] = doc.phones || [];
      let names: string[] = doc.names || [];

      // extract basic fields from customData
      for (const name of this.companyFieldNames()) {
        trackedData = trackedData.filter(e => e.field !== name);
      }

      trackedData = trackedData.filter(e => e.field !== 'name');

      doc.trackedData = trackedData;

      if (company) {
        emails = Array.from(new Set([...(company.emails || []), ...emails]));
        phones = Array.from(new Set([...(company.phones || []), ...phones]));
        names = Array.from(new Set([...(company.names || []), ...names]));
      }

      if (doc.email) {
        if (!emails.includes(doc.email)) {
          emails.push(doc.email);
        }

        doc.primaryEmail = doc.email;

        delete doc.email;
      }

      if (doc.phone) {
        if (!phones.includes(doc.phone)) {
          phones.push(doc.phone);
        }

        doc.primaryPhone = doc.phone;

        delete doc.phone;
      }

      if (doc.name) {
        if (!names.includes(doc.name)) {
          names.push(doc.name);
        }

        delete doc.name;
      }

      doc.emails = emails;
      doc.phones = phones;
      doc.names = names;

      return doc;
    }

    public static async findActiveCompanies(selector, fields) {
      return models.Companies.find(
        { ...selector, status: { $ne: 'deleted' } },
        fields
      ).lean();
    }

    /**
     * Retreives company
     */
    public static async getCompany(_id: string) {
      const company = await models.Companies.findOne({ _id });

      if (!company) {
        throw new Error('Company not found');
      }

      return company;
    }

    /**
     * Create a company
     */
    // public static async createCompany(doc: ICompany, user: IUserDocument) {
    public static async createCompany(doc: ICompany, user: any) {
      // Checking duplicated fields of company
      await models.Companies.checkDuplication(doc);

      if (!doc.ownerId && user) {
        doc.ownerId = user._id;
      }

      this.fixListFields(doc, doc.trackedData);

      // clean custom field values
      doc.customFieldsData = await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: doc.customFieldsData,
        isRPC: true
      });

      const company = await models.Companies.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: models.Companies.fillSearchText(doc)
      });

      // create log
      await putActivityLog(subdomain, {
        action: 'createCocLog',
        data: {
          coc: company,
          contentType: 'company',
          ...prepareCocLogData(company)
        }
      });

      return company;
    }

    /**
     * Update company
     */
    public static async updateCompany(_id: string, doc: ICompany) {
      // Checking duplicated fields of company
      await models.Companies.checkDuplication(doc, [_id]);

      const company = await models.Companies.getCompany(_id);

      this.fixListFields(doc, doc.trackedData, company);

      // clean custom field values
      if (doc.customFieldsData) {
        doc.customFieldsData = await sendFormsMessage({
          subdomain,
          action: 'fields.prepareCustomFieldsData',
          data: doc.customFieldsData,
          isRPC: true
        });
      }

      const searchText = models.Companies.fillSearchText(
        Object.assign(await models.Companies.getCompany(_id), doc) as ICompany
      );

      await models.Companies.updateOne(
        { _id },
        { $set: { ...doc, searchText, modifiedAt: new Date() } }
      );

      return models.Companies.findOne({ _id });
    }

    /**
     * Remove company
     */
    public static async removeCompanies(companyIds: string[]) {
      // Removing modules associated with company
      await putActivityLog(subdomain, {
        action: 'removeActivityLogs',
        data: { type: ACTIVITY_CONTENT_TYPES.COMPANY, itemIds: companyIds }
      });

      await sendInternalNotesMessage({
        subdomain,
        action: 'removeInternalNotes',
        data: {
          contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
          contentTypeIds: companyIds
        }
      });
      await sendCoreMessage({
        subdomain,
        action: 'conformities.removeConformities',
        data: { mainType: 'company', mainTypeIds: companyIds }
      });

      return models.Companies.deleteMany({ _id: { $in: companyIds } });
    }

    /**
     * Merge companies
     */
    public static async mergeCompanies(
      companyIds: string[],
      companyFields: ICompany
    ) {
      // Checking duplicated fields of company
      await this.checkDuplication(companyFields, companyIds);

      let scopeBrandIds: string[] = [];
      let customFieldsData: ICustomField[] = [];
      let tagIds: string[] = [];
      let names: string[] = [];
      let emails: string[] = [];
      let phones: string[] = [];

      // Merging company tags
      for (const companyId of companyIds) {
        const companyObj = await models.Companies.getCompany(companyId);

        const companyTags = companyObj.tagIds || [];
        const companyNames = companyObj.names || [];
        const companyEmails = companyObj.emails || [];
        const companyPhones = companyObj.phones || [];
        const companyScopeBrandIds = companyObj.scopeBrandIds || [];

        // Merging scopeBrandIds
        scopeBrandIds = scopeBrandIds.concat(companyScopeBrandIds);

        // merge custom fields data
        customFieldsData = [
          ...customFieldsData,
          ...(companyObj.customFieldsData || [])
        ];

        // Merging company's tag into 1 array
        tagIds = tagIds.concat(companyTags);

        // Merging company names
        names = names.concat(companyNames);

        // Merging company emails
        emails = emails.concat(companyEmails);

        // Merging company phones
        phones = phones.concat(companyPhones);

        companyObj.status = 'deleted';

        await models.Companies.findByIdAndUpdate(companyId, {
          $set: { status: 'deleted' }
        });
      }

      // Removing Duplicates
      tagIds = Array.from(new Set(tagIds));
      names = Array.from(new Set(names));
      emails = Array.from(new Set(emails));
      phones = Array.from(new Set(phones));

      // Creating company with properties
      const company = await models.Companies.createCompany({
        ...companyFields,
        scopeBrandIds,
        customFieldsData,
        tagIds,
        mergedIds: companyIds,
        names,
        emails,
        phones
      });

      // Updating customer companies, deals, tasks, tickets, purchase
      await sendCoreMessage({
        subdomain,
        action: 'conformities.changeConformity',
        data: {
          type: 'company',
          newTypeId: company._id,
          oldTypeIds: companyIds
        }
      });

      // Removing modules associated with current companies
      await sendInternalNotesMessage({
        subdomain,
        action: 'batchUpdate',
        data: {
          contentType: 'contacts:company',
          newContentTypeId: company._id,
          oldContentTypeIds: companyIds
        }
      });

      return company;
    }
  }

  companySchema.loadClass(Company);

  return companySchema;
};
