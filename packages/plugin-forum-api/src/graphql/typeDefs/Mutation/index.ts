import categoryMutations from './categoryMutations';
import postMutations from './postMutations';
import commentMutations from './commentMutations';
import voteMutations from './voteMutations';
import followMutations from './followMutations';
import permissionGroup from './permissionGroup';
import subscriptionProduct from './subscriptionProduct';

const Mutation = `
  extend type Mutation {
    ${categoryMutations}
    ${postMutations}
    ${commentMutations}
    ${voteMutations}
    ${followMutations}
    ${permissionGroup}
    ${subscriptionProduct}
  }
`;

export default Mutation;
