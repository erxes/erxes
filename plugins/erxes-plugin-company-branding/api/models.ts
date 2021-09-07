import { companyBrandingSchema } from './definitions';

class CompanyBranding {
  /**
   * Create a CompanyBranding Document of company_brandings collection
   */
  public static async createCompanyBranding(models, doc) {

    const cb = await models.CompanyBrandings.create({
      ...doc
    });
    return cb
  }

  /**
   * Update Company Branding
   */
  public static async updateCompanyBranding(models, doc) {
    const { _id } = doc

    delete doc._id

    return models.CompanyBrandings.updateOne({ _id: _id }, { $set: doc });
  }

}
export default [
  {
    name: 'CompanyBrandings',
    schema: companyBrandingSchema,
    klass: CompanyBranding
  },
];
