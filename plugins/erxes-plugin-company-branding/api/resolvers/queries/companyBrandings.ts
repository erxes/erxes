// import { paginate } from 'erxes-api-utils'

const campanyBrandingQueries = [
  {
    name: 'companyBrandings',
    handler: async (_root, params, { user, docModifier, models, checkPermission, messageBroker }) => {

      const bool = await models.CompanyBrandings.findOne({})
      console.log("findOne", bool)
      return bool

    }
  }
]
export default campanyBrandingQueries;