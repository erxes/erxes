import { putCreateLog, putDeleteLog, putUpdateLog } from "erxes-api-utils";


const companyBrandingMutations = [
  {
    name: 'companyBrandingSave',
    handler: async (_root, doc, { user, docModifier, models, checkPermission, messageBroker }) => {
      await checkPermission('manageCars', user);
      const create = models.CompanyBrandings.createCompanyBranding(models, docModifier(doc), user)

      return create
      // const bool = await models.CompanyBrandings.find({})
      // console.log(bool[0])
      // return "heey"

    }
  },
  {
    name: 'companyBrandingEdit',
    handler: async (_root, doc, { user, docModifier, models, checkPermission, messageBroker }) => {
      // await checkPermission('manageCars', user);

      const updated = models.CompanyBrandings.updateCompanyBranding(models, docModifier(doc), user)

      return updated
    }
  },
]

export default companyBrandingMutations;
