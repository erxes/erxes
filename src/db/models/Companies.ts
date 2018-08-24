import { Model, model } from "mongoose";
import { ActivityLogs, Customers, Fields, InternalNotes } from "./";
import {
  companySchema,
  ICompanyDocument,
  ILink
} from "./definitions/companies";
import { COMPANY_BASIC_INFOS } from "./definitions/constants";
import { IUserDocument } from "./definitions/users";
import { bulkInsert } from "./utils";

interface ICompanyFieldsInput {
  primaryName: string;
}

interface ICreateCompanyInput {
  primaryName: string;
  names?: string[];
  size?: number;
  industry?: string;
  website?: string;
  plan?: string;
  parentCompanyId?: string;
  email?: string;
  ownerId?: string;
  phone?: string;
  leadStatus?: string;
  lifecycleState?: string;
  businessType?: string;
  description?: string;
  employees?: number;
  doNotDisturb?: string;
  links?: ILink;
  tagIds?: string[];
  customFieldsData?: any;
}

interface ICompanyModel extends Model<ICompanyDocument> {
  checkDuplication(
    companyFields: ICompanyFieldsInput,
    idsToExclude?: string[] | string
  ): never;

  createCompany(
    doc: ICreateCompanyInput,
    user?: IUserDocument
  ): Promise<ICompanyDocument>;
  updateCompany(_id: string, doc: ICompanyDocument): Promise<ICompanyDocument>;

  updateCustomers(
    _id: string,
    customerIds: string[]
  ): Promise<ICompanyDocument>;

  removeCompany(_id: string): void;

  mergeCompanies(
    companyIds: string[],
    companyFields: ICreateCompanyInput
  ): Promise<ICompanyDocument>;

  bulkInsert(
    fieldNames: string[],
    fieldValues: string[],
    { user }: { user: IUserDocument }
  ): Promise<string[]>;
}

class Company {
  /**
   * Checking if company has duplicated unique properties
   */
  public static async checkDuplication(
    companyFields: ICompanyFieldsInput,
    idsToExclude?: string[] | string
  ) {
    const query: { [key: string]: any } = {};

    // Adding exclude operator to the query
    if (idsToExclude) {
      query._id =
        idsToExclude instanceof Array
          ? { $nin: idsToExclude }
          : { $ne: idsToExclude };
    }

    if (companyFields.primaryName) {
      // check duplication from primaryName
      let previousEntry = await Companies.find({
        ...query,
        primaryName: companyFields.primaryName
      });

      if (previousEntry.length > 0) {
        throw new Error("Duplicated name");
      }

      // check duplication from names
      previousEntry = await Companies.find({
        ...query,
        names: { $in: [companyFields.primaryName] }
      });

      if (previousEntry.length > 0) {
        throw new Error("Duplicated name");
      }
    }
  }

  /**
   * Create a company
   */
  public static async createCompany(doc, user) {
    // Checking duplicated fields of company
    await this.checkDuplication(doc);

    if (!doc.ownerId && user) {
      doc.ownerId = user._id;
    }

    // clean custom field values
    doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
    doc.createdAt = new Date();
    doc.modifiedAt = new Date();

    return Companies.create(doc);
  }

  /**
   * Update company
   */
  public static async updateCompany(_id, doc) {
    // Checking duplicated fields of company
    await this.checkDuplication(doc, [_id]);

    if (doc.customFieldsData) {
      // clean custom field values
      doc.customFieldsData = await Fields.cleanMulti(
        doc.customFieldsData || {}
      );
    }

    doc.modifiedAt = new Date();

    await Companies.update({ _id }, { $set: doc });

    return Companies.findOne({ _id });
  }

  /**
   * Update company customers
   */
  public static async updateCustomers(_id, customerIds) {
    // Removing companyIds from users
    await Customers.updateMany(
      { companyIds: { $in: [_id] } },
      { $pull: { companyIds: _id } }
    );

    // Adding companyId to the each customers
    for (const customerId of customerIds) {
      await Customers.findByIdAndUpdate(
        { _id: customerId },
        { $addToSet: { companyIds: _id } },
        { upsert: true }
      );
    }

    return Companies.findOne({ _id });
  }

  /**
   * Remove company
   */
  public static async removeCompany(companyId) {
    // Removing modules associated with company
    await ActivityLogs.removeCompanyActivityLog(companyId);
    await InternalNotes.removeCompanyInternalNotes(companyId);

    await Customers.updateMany(
      { companyIds: { $in: [companyId] } },
      { $pull: { companyIds: companyId } }
    );

    return Companies.remove({ _id: companyId });
  }

  /**
   * Merge companies
   */
  public static async mergeCompanies(companyIds, companyFields) {
    // Checking duplicated fields of company
    await this.checkDuplication(companyFields, companyIds);

    let tagIds = [];
    let names = [];

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
      names
    });

    // Updating customer companies
    for (const companyId of companyIds) {
      await Customers.updateMany(
        { companyIds: { $in: [companyId] } },
        { $push: { companyIds: company._id } }
      );

      await Customers.updateMany(
        { companyIds: { $in: [companyId] } },
        { $pull: { companyIds: companyId } }
      );
    }

    // Removing modules associated with current companies
    await ActivityLogs.changeCompany(company._id, companyIds);
    await InternalNotes.changeCompany(company._id, companyIds);

    return company;
  }

  /**
   * Imports customers with basic fields and custom properties
   */
  public static async bulkInsert(
    fieldNames: string[],
    fieldValues: string[],
    { user }: { user: IUserDocument }
  ) {
    const params = {
      fieldNames,
      fieldValues,
      user,
      basicInfos: COMPANY_BASIC_INFOS,
      contentType: "company",
      create: this.createCompany
    };

    return bulkInsert(params);
  }
}

companySchema.loadClass(Company);

const Companies = model<ICompanyDocument, ICompanyModel>(
  "companies",
  companySchema
);

export default Companies;
