import { paginate } from 'erxes-api-utils'

const campanyBrandingsQueries = [
  {
    name: 'companyBrandings',
    handler: async (_root, params, { user, docModifier, models, checkPermission, messageBroker }) => {

      // await checkPermission('manageCars', user);
      const bool = await models.CompanyBrandings.find({})
      return bool[0]

      // console.log(bool)

      // if (bool.length == 0) {
      //   const create = models.CompanyBrandings.createCompanyBranding(models, docModifier(doc), user)

      //   return create
      // }
      // else { return  models.CompanyBrandings.updateOne({ _id: bool[0]._id }, { $set: doc }) }

    }
  }
]
export default campanyBrandingsQueries;