import { companyBrandingSchema } from './definitions';

class CompanyBranding {
  /**
   * Create a CompanyBranding Document of company_brandings collection
   */
  public static async createCompanyBranding(models, doc, user = undefined) {

    const cb = await models.CompanyBrandings.create({
      ...doc
    });

    // // create log
    // await models.ActivityLogs.createCocLog({ coc: car, contentType: 'car' });

    return cb
  }

  /**
   * Update Company Branding
   */
  public static async updateCompanyBranding(models, doc, user = undefined) {
    const { _id } = doc

    delete doc._id

    return models.CompanyBrandings.updateOne({ _id: _id }, { $set: doc });
  }

}

//

export default [
  {
    name: 'CompanyBrandings',
    schema: companyBrandingSchema,
    klass: CompanyBranding
  },
];
