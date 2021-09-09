const campanyBrandingQueries = [
  {
    name: 'companyBrandings',
    handler: async (_root, params, { models }) => {

      const bool = await models.CompanyBrandings.findOne({})   
      return bool
    }
  }
]
export default campanyBrandingQueries;