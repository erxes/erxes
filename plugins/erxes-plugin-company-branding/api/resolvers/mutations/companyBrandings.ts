const companyBrandingMutations = [
  {
    name: 'companyBrandingSave',
    handler: async (_root, doc, { user, docModifier, models, checkPermission, messageBroker }) => {
      const create = models.CompanyBrandings.createCompanyBranding(models, docModifier(doc), user)
      return create
    }
  },
  {
    name: 'companyBrandingEdit',
    handler: async (_root, doc, { user, docModifier, models, checkPermission, messageBroker }) => {
      const updated = models.CompanyBrandings.updateCompanyBranding(models, docModifier(doc), user)
      return updated
    }
  },
]

export default companyBrandingMutations;
