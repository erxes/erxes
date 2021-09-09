const campanyBrandingQueries = [
  {
    name: 'companyBrandings',
    handler: async (_root, params, { models, checkPermission, user}) => {
      await checkPermission('showCompanyBranding', user);
      if(params){
        const bool = await models.CompanyBrandings.findOne({})   
        return bool
      }
      return null
    }
  }
]
export default campanyBrandingQueries;