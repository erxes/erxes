import { mutations as companyMutations } from 'erxes-ui/lib/companies/graphql';

const companiesAdd = companyMutations.companiesAdd;

const companiesEdit = companyMutations.companiesEdit;

const companiesRemove = `
  mutation companiesRemove($companyIds: [String]) {
    companiesRemove(companyIds: $companyIds)
  }
`;

const companiesMerge = `
  mutation companiesMerge($companyIds: [String], $companyFields: JSON) {
    companiesMerge(companyIds: $companyIds, companyFields: $companyFields) {
      _id
    }
  }
`;

export default {
  companiesAdd,
  companiesEdit,
  companiesRemove,
  companiesMerge
};
