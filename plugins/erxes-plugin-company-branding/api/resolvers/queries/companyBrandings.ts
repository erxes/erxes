const campanyBrandingQueries = [
  {
    name: 'companyBrandings',
    handler: async (_root, params, { user, docModifier, models, checkPermission, messageBroker }) => {
      const bool = await models.CompanyBrandings.findOne({})
      
      return bool
    }
  }
]
export default campanyBrandingQueries;