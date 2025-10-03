import { companySchema } from '@/contacts/db/definitions/company';
import {
  ICompany,
  ICompanyDocument,
  ICustomField,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { validSearchText } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ICompanyModel extends Model<ICompanyDocument> {
  getCompany(_id: string): Promise<ICompanyDocument>;
  getCompanyName(company: ICompany): string;

  findActiveCompanies(
    query,
    fields?,
    skip?,
    limit?,
  ): Promise<ICompanyDocument[]>;

  createCompany(doc: ICompany, user?: IUserDocument): Promise<ICompanyDocument>;
  updateCompany(_id: string, doc: ICompany): Promise<ICompanyDocument>;
  removeCompanies(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeCompanies(
    companyIds: string[],
    companyFields: ICompany,
  ): Promise<ICompanyDocument>;
}

export const loadCompanyClass = (models: IModels) => {
  class Company {
    /**
     * Retreive company
     */
    public static async getCompany(_id: string) {
      const company = await models.Companies.findOne({ _id });

      if (!company) {
        throw new Error('Company not found');
      }

      return company;
    }

    /**
     * Retrieve company name
     */
    public static getCompanyName(company: ICompany) {
      return (
        company.primaryName ||
        company.primaryEmail ||
        company.primaryPhone ||
        'Unknown'
      );
    }

    /**
     * Retreive active companies
     */
    public static async findActiveCompanies(query, fields?, skip?, limit?) {
      return models.Companies.find(
        { ...query, status: { $ne: 'deleted' } },
        fields,
      )
        .skip(skip || 0)
        .limit(limit || 0)
        .lean();
    }

    /**
     * Create a company
     */
    public static async createCompany(doc: ICompany, user: any) {
      // Checking duplicated fields of company
      await this.checkDuplication(doc);

      if (!doc.ownerId && user) {
        doc.ownerId = user._id;
      }

      this.fixListFields(doc, doc.trackedData);

      if (doc.customFieldsData) {
        doc.customFieldsData = await models.Fields.prepareCustomFieldsData(
          doc.customFieldsData,
        );
      }

      const company = await models.Companies.create({
        ...doc,
        createdAt: new Date(),
        updatedAt: new Date(),
        searchText: this.fillSearchText(doc),
      });

      return company;
    }

    /**
     * Update company
     */
    public static async updateCompany(_id: string, doc: ICompany) {
      // Checking duplicated fields of company
      await this.checkDuplication(doc, [_id]);

      const company = await models.Companies.getCompany(_id);

      this.fixListFields(doc, doc.trackedData, company);

      // clean custom field values
      if (doc.customFieldsData) {
        doc.customFieldsData = await models.Fields.prepareCustomFieldsData(
          doc.customFieldsData,
        );
      }

      const searchText = this.fillSearchText(
        Object.assign({}, company, doc) as ICompany,
      );

      await models.Companies.updateOne(
        { _id },
        { $set: { ...doc, searchText, updatedAt: new Date() } },
      );

      return models.Companies.findOne({ _id });
    }

    /**
     * Remove company
     */
    public static async removeCompanies(companyIds: string[]) {
      return models.Companies.deleteMany({ _id: { $in: companyIds } });
    }

    /**
     * Merge companies
     */
    public static async mergeCompanies(
      companyIds: string[],
      companyFields: ICompany,
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
          ...(companyObj.customFieldsData || []),
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
          $set: { status: 'deleted' },
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
        phones,
      });

      return company;
    }

    /**
     * Checking if company has duplicated unique properties
     */
    public static async checkDuplication(
      companyFields: {
        primaryName?: string;
        code?: string;
      },
      idsToExclude?: string[] | string,
    ) {
      const query: { status: { $ne: string }; [key: string]: any } = {
        status: { $ne: 'deleted' },
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
          primaryName: companyFields.primaryName,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated name');
        }
      }

      if (companyFields.code) {
        // check duplication from code
        previousEntry = await models.Companies.find({
          ...query,
          code: companyFields.code,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated code');
        }
      }
    }

    public static fillSearchText(doc: ICompany) {
      return validSearchText([
        doc.primaryName || ' ',
        (doc.names || []).join(' '),
        (doc.emails || []).join(' '),
        (doc.phones || []).join(' '),
        doc.website || '',
        doc.industry || '',
        doc.plan || '',
        doc.description || '',
        doc.code || '',
      ]);
    }

    public static companyFieldNames() {
      const names: string[] = [];

      companySchema.eachPath((name) => {
        names.push(name);

        const path = companySchema.paths[name];

        if (path.schema) {
          path.schema.eachPath((subName) => {
            names.push(`${name}.${subName}`);
          });
        }
      });

      return names;
    }

    public static fixListFields(
      doc: any,
      trackedData: any[] = [],
      company?: ICompanyDocument,
    ) {
      let emails: string[] = doc.emails || [];
      let phones: string[] = doc.phones || [];
      let names: string[] = doc.names || [];

      // extract basic fields from customData
      for (const name of this.companyFieldNames()) {
        trackedData = trackedData.filter((e) => e.field !== name);
      }

      trackedData = trackedData.filter((e) => e.field !== 'name');

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
  }

  companySchema.loadClass(Company);

  return companySchema;
};
