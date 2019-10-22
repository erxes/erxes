import { Model, model } from 'mongoose';
import { ActivityLogs, Conformities, Fields, InternalNotes } from './';
import { companySchema, ICompany, ICompanyDocument } from './definitions/companies';
import { STATUSES } from './definitions/constants';
import { IUserDocument } from './definitions/users';

export interface ICompanyModel extends Model<ICompanyDocument> {
  checkDuplication(
    companyFields: {
      primaryName?: string;
    },
    idsToExclude?: string[] | string,
  ): never;

  fillSearchText(doc: ICompany): string;

  getCompany(_id: string): Promise<ICompanyDocument>;

  createCompany(doc: ICompany, user?: IUserDocument): Promise<ICompanyDocument>;

  updateCompany(_id: string, doc: ICompany): Promise<ICompanyDocument>;

  removeCompany(_id: string): void;

  mergeCompanies(companyIds: string[], companyFields: ICompany): Promise<ICompanyDocument>;

  bulkInsert(fieldNames: string[], fieldValues: string[][], user: IUserDocument): Promise<string[]>;
}

export const loadClass = () => {
  class Company {
    /**
     * Checking if company has duplicated unique properties
     */
    public static async checkDuplication(
      companyFields: {
        primaryName?: string;
      },
      idsToExclude?: string[] | string,
    ) {
      const query: { status: {}; [key: string]: any } = { status: { $ne: STATUSES.DELETED } };

      // Adding exclude operator to the query
      if (idsToExclude) {
        query._id = idsToExclude instanceof Array ? { $nin: idsToExclude } : { $ne: idsToExclude };
      }

      if (companyFields.primaryName) {
        // check duplication from primaryName
        let previousEntry = await Companies.find({
          ...query,
          primaryName: companyFields.primaryName,
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated name');
        }

        // check duplication from names
        previousEntry = await Companies.find({
          ...query,
          names: { $in: [companyFields.primaryName] },
        });

        if (previousEntry.length > 0) {
          throw new Error('Duplicated name');
        }
      }
    }

    public static fillSearchText(doc: ICompany) {
      return [
        doc.primaryName || '',
        doc.primaryEmail || '',
        doc.primaryPhone || '',
        doc.website || '',
        doc.industry || '',
        doc.plan || '',
        (doc.names || []).join(' '),
        (doc.emails || []).join(' '),
        (doc.phones || []).join(' '),
      ].join(' ');
    }

    /**
     * Retreives company
     */
    public static async getCompany(_id: string) {
      const company = await Companies.findOne({ _id });

      if (!company) {
        throw new Error('Company not found');
      }

      return company;
    }

    /**
     * Create a company
     */
    public static async createCompany(doc: ICompany, user: IUserDocument) {
      // Checking duplicated fields of company
      await Companies.checkDuplication(doc);

      if (!doc.ownerId && user) {
        doc.ownerId = user._id;
      }

      // clean custom field values
      doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

      const company = await Companies.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: Companies.fillSearchText(doc),
      });

      // create log
      await ActivityLogs.createCompanyLog(company);

      return company;
    }

    /**
     * Update company
     */
    public static async updateCompany(_id: string, doc: ICompany) {
      // Checking duplicated fields of company
      await Companies.checkDuplication(doc, [_id]);

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
      }

      await Companies.updateOne(
        { _id },
        { $set: { ...doc, searchText: Companies.fillSearchText(doc), modifiedAt: new Date() } },
      );

      return Companies.findOne({ _id });
    }

    /**
     * Remove company
     */
    public static async removeCompany(companyId: string) {
      // Removing modules associated with company
      await InternalNotes.removeCompanyInternalNotes(companyId);

      await Conformities.removeConformity({ mainType: 'company', mainTypeId: companyId });

      return Companies.deleteOne({ _id: companyId });
    }

    /**
     * Merge companies
     */
    public static async mergeCompanies(companyIds: string[], companyFields: ICompany) {
      // Checking duplicated fields of company
      await this.checkDuplication(companyFields, companyIds);

      let scopeBrandIds: string[] = [];
      let tagIds: string[] = [];
      let names: string[] = [];
      let emails: string[] = [];
      let phones: string[] = [];

      // Merging company tags
      for (const companyId of companyIds) {
        const companyObj = await Companies.findOne({ _id: companyId });

        if (companyObj) {
          const companyTags = companyObj.tagIds || [];
          const companyNames = companyObj.names || [];
          const companyEmails = companyObj.emails || [];
          const companyPhones = companyObj.phones || [];

          // Merging scopeBrandIds
          scopeBrandIds = [...scopeBrandIds, ...(companyObj.scopeBrandIds || [])];

          // Merging company's tag into 1 array
          tagIds = tagIds.concat(companyTags);

          // Merging company names
          names = names.concat(companyNames);

          // Merging company emails
          emails = emails.concat(companyEmails);

          // Merging company phones
          phones = phones.concat(companyPhones);

          companyObj.status = STATUSES.DELETED;

          await Companies.findByIdAndUpdate(companyId, { $set: { status: STATUSES.DELETED } });
        }
      }

      // Removing Duplicates
      tagIds = Array.from(new Set(tagIds));
      names = Array.from(new Set(names));
      emails = Array.from(new Set(emails));
      phones = Array.from(new Set(phones));

      // Creating company with properties
      const company = await Companies.createCompany({
        ...companyFields,
        scopeBrandIds,
        tagIds,
        mergedIds: companyIds,
        names,
        emails,
        phones,
      });

      // Updating customer companies, deals, tasks, tickets
      await Conformities.changeConformity({ type: 'company', newTypeId: company._id, oldTypeIds: companyIds });

      // Removing modules associated with current companies
      await InternalNotes.changeCompany(company._id, companyIds);

      return company;
    }
  }

  companySchema.loadClass(Company);

  return companySchema;
};

loadClass();

// tslint:disable-next-line
const Companies = model<ICompanyDocument, ICompanyModel>('companies', companySchema);

export default Companies;
