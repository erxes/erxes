import { paginate } from 'erxes-api-utils'

const campanyBrandingQueries = [
  {
    name: 'companyBrandings',
    handler: async (_root, params, { user, docModifier, models, checkPermission, messageBroker }) => {

      // await checkPermission('manageCars', user);
      const bool = await models.CompanyBrandings.find({})
      return bool[0]
  
    }
  }
]
export default campanyBrandingQueries;