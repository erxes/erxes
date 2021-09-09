const companyBrandingMutations = [
  {
    name: 'companyBrandingSave',
    handler: async (_root, doc, { user, docModifier, models}) => {
      const create = await models.CompanyBrandings.createCompanyBranding(models, docModifier(doc), user)
      return create


    }
  },
  {
    name: 'companyBrandingEdit',
    handler: async (_root, doc, { user, docModifier, models}) => {
      const updated = await models.CompanyBrandings.updateCompanyBranding(models, docModifier(doc), user)
      return updated
    }
  },
]

export default companyBrandingMutations;
