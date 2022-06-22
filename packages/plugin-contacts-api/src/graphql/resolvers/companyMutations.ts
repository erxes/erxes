import { checkPermission } from '@erxes/api-utils/src/permissions';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { ICompany } from '../../models/definitions/companies';
import { MODULE_NAMES } from '../../constants';
import { IContext } from '../../connectionResolver';

interface ICompaniesEdit extends ICompany {
  _id: string;
}

const companyMutations = {
  /**
   * Creates a new company
   */
  async companiesAdd(
    _root,
    doc: ICompany,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const company = await models.Companies.createCompany(
      docModifier(doc),
      user
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.COMPANY,
        newData: doc,
        object: company
      },
      user
    );

    return company;
  },

  /**
   * Updates a company
   */
  async companiesEdit(
    _root,
    { _id, ...doc }: ICompaniesEdit,
    { user, models, subdomain }: IContext
  ) {
    const company = await models.Companies.getCompany(_id);
    const updated = await models.Companies.updateCompany(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.COMPANY,
        object: company,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Finding customer to update by searching primaryEmail,primarPhone etc ...
   */
  async companiesEditByField(
    _root,
    {
      selector,
      doc
    }: {
      selector: {
        primaryName?: string;
        primaryEmail?: string;
        primaryPhone?: string;
        code?: string;
      };
      doc: ICompaniesEdit;
    },
    { models }: IContext
  ) {
    let company;

    if (selector.primaryEmail) {
      company = await models.Companies.findOne({
        primaryEmail: selector.primaryEmail
      }).lean();
    }

    if (!company && selector.primaryPhone) {
      company = await models.Companies.findOne({
        primarPhone: selector.primaryPhone
      }).lean();
    }

    if (!company && selector.code) {
      company = await models.Companies.findOne({ code: selector.code }).lean();
    }

    if (!company && selector.primaryName) {
      company = await models.Companies.findOne({
        primaryName: selector.primaryName
      }).lean();
    }

    if (!company) {
      throw new Error('Company not found');
    }

    if (doc.customFieldsData) {
      const prevCustomFieldsData = company.customFieldsData || [];

      for (const data of doc.customFieldsData) {
        const prevEntry = prevCustomFieldsData.find(
          d => d.field === data.field
        );

        if (prevEntry) {
          prevEntry.value = data.value;
        } else {
          prevCustomFieldsData.push(data);
        }
      }

      doc.customFieldsData = prevCustomFieldsData;
    }

    return models.Companies.updateCompany(company._id, doc);
  },

  /**
   * Removes companies
   */
  async companiesRemove(
    _root,
    { companyIds }: { companyIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const companies = await models.Companies.find({
      _id: { $in: companyIds }
    }).lean();

    await models.Companies.removeCompanies(companyIds);

    for (const company of companies) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.COMPANY, object: company },
        user
      );
    }

    return companyIds;
  },

  /**
   * Merge companies
   */
  async companiesMerge(
    _root,
    {
      companyIds,
      companyFields
    }: { companyIds: string[]; companyFields: ICompany },
    { models: { Companies } }: IContext
  ) {
    return Companies.mergeCompanies(companyIds, companyFields);
  }
};

checkPermission(companyMutations, 'companiesAdd', 'companiesAdd');
checkPermission(companyMutations, 'companiesEdit', 'companiesEdit');
checkPermission(companyMutations, 'companiesEditByField', 'companiesEdit');
checkPermission(companyMutations, 'companiesRemove', 'companiesRemove');
checkPermission(companyMutations, 'companiesMerge', 'companiesMerge');

export default companyMutations;
