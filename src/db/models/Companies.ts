import { Model, model } from 'mongoose';
import { ActivityLogs, Customers, Fields, InternalNotes } from './';
import { companySchema, ICompany, ICompanyDocument } from './definitions/companies';
import { COMPANY_BASIC_INFOS } from './definitions/constants';
import { IUserDocument } from './definitions/users';
import { bulkInsert } from './utils';

interface ICompanyModel extends Model<ICompanyDocument> {
  checkDuplication(
    companyFields: {
      primaryName?: string;
    },
    idsToExclude?: string[] | string,
  ): never;

  createCompany(doc: ICompany, user?: IUserDocument): Promise<ICompanyDocument>;

  updateCompany(_id: string, doc: ICompany): Promise<ICompanyDocument>;

  updateCustomers(_id: string, customerIds: string[]): Promise<ICompanyDocument>;

  removeCompany(_id: string): void;

  mergeCompanies(companyIds: string[], companyFields: ICompany): Promise<ICompanyDocument>;

  bulkInsert(fieldNames: string[], fieldValues: string[][], user: IUserDocument): Promise<string[]>;
}

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
    const query: { [key: string]: any } = {};

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

    return Companies.create({
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
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

    await Companies.update({ _id }, { $set: { ...doc, modifiedAt: new Date() } });

    return Companies.findOne({ _id });
  }

  /**
   * Update company customers
   */
  public static async updateCustomers(_id: string, customerIds: string[]) {
    // Removing companyIds from users
    await Customers.updateMany({ companyIds: { $in: [_id] } }, { $pull: { companyIds: _id } });

    // Adding companyId to the each customers
    for (const customerId of customerIds) {
      await Customers.findByIdAndUpdate({ _id: customerId }, { $addToSet: { companyIds: _id } }, { upsert: true });
    }

    return Companies.findOne({ _id });
  }

  /**
   * Remove company
   */
  public static async removeCompany(companyId: string) {
    // Removing modules associated with company
    await ActivityLogs.removeCompanyActivityLog(companyId);
    await InternalNotes.removeCompanyInternalNotes(companyId);

    await Customers.updateMany({ companyIds: { $in: [companyId] } }, { $pull: { companyIds: companyId } });

    return Companies.remove({ _id: companyId });
  }

  /**
   * Merge companies
   */
  public static async mergeCompanies(companyIds: string[], companyFields: ICompany) {
    // Checking duplicated fields of company
    await this.checkDuplication(companyFields, companyIds);

    let tagIds: string[] = [];
    let names: string[] = [];

    // Merging company tags
    for (const companyId of companyIds) {
      const companyObj = await Companies.findOne({ _id: companyId });

      if (companyObj) {
        const companyTags = companyObj.tagIds || [];
        const companyNames = companyObj.names || [];

        // Merging company's tag into 1 array
        tagIds = tagIds.concat(companyTags);

        // Merging company names
        names = names.concat(companyNames);

        // Removing company
        await Companies.remove({ _id: companyId });
      }
    }

    // Removing Duplicated Tags from company
    tagIds = Array.from(new Set(tagIds));

    // Removing Duplicated names from company
    names = Array.from(new Set(names));

    // Creating company with properties
    const company = await Companies.createCompany({
      ...companyFields,
      tagIds,
      names,
    });

    // Updating customer companies
    for (const companyId of companyIds) {
      await Customers.updateMany({ companyIds: { $in: [companyId] } }, { $push: { companyIds: company._id } });

      await Customers.updateMany({ companyIds: { $in: [companyId] } }, { $pull: { companyIds: companyId } });
    }

    // Removing modules associated with current companies
    await ActivityLogs.changeCompany(company._id, companyIds);
    await InternalNotes.changeCompany(company._id, companyIds);

    return company;
  }

  /**
   * Imports customers with basic fields and custom properties
   */
  public static async bulkInsert(fieldNames: string[], fieldValues: string[][], user: IUserDocument) {
    const params = {
      fieldNames,
      fieldValues,
      user,
      basicInfos: COMPANY_BASIC_INFOS,
      contentType: 'company',
      create: (doc, userObj) => this.createCompany(doc, userObj),
    };

    return bulkInsert(params);
  }
}

companySchema.loadClass(Company);

const Companies = model<ICompanyDocument, ICompanyModel>('companies', companySchema);

export default Companies;
