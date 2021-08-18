import { putCreateLog, putDeleteLog, putUpdateLog } from "erxes-api-utils";


const companyBrandingMutations = [
  {
    name: 'companyBrandingSave',
    handler: async (_root, doc, { user, docModifier, models, checkPermission, messageBroker }) => {
      // await checkPermission('manageCars', user);
      console.log(doc)
      
      const bool = await models.CompanyBrandings.find({})

      console.log(bool)

      if (bool.length == 0) {
        const create = models.CompanyBrandings.createCompanyBranding(models, docModifier(doc), user)

        return create
      }
      else { return  models.CompanyBrandings.updateOne({ _id: bool[0]._id }, { $set: doc }) }

    }
  },



]

export default companyBrandingMutations;
