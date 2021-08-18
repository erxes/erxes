import { companyBrandingSchema } from './definitions';

class CompanyBranding {
  /**
   * Create a car
   */
  // public static async createCompanyBranding(models, doc, user = undefined) {

  //   console.log(doc)

  //   const cb = await models.CompanyBrandings.create({
  //     ...doc
  //   });

  //   // // create log
  //   // await models.ActivityLogs.createCocLog({ coc: car, contentType: 'car' });

  //   return cb
  // }

  /**
   * Update car
   */
  // public static async updateCompanyBranding(models, _id, doc) {

  //   // await models.CompanyBrandings.updateOne({ _id }, { $set: { ...doc } });

  //   return models.CompanyBrandings.findOne({ _id });
  // }
}

//

export default [
  {
    name: 'CompanyBrandings',
    schema: companyBrandingSchema,
    klass: CompanyBranding
  },
];
