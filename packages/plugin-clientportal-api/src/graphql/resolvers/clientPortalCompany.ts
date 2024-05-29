import { IContext } from '../../connectionResolver';

const ClientPortalCompany = {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    return models.Companies.findOne({ _id });
  },

  company(company) {
    return (
      company.erxesCompanyId && {
        __typename: 'Company',
        _id: company.erxesCompanyId,
      }
    );
  },
};

export { ClientPortalCompany };
