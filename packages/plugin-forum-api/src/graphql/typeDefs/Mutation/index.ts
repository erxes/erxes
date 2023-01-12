import categoryMutations from './categoryMutations';
import postMutations from './postMutations';
import commentMutations from './commentMutations';
import voteMutations from './voteMutations';
import followMutations from './followMutations';
import permissionGroup from './permissionGroup';
import subscriptionProduct from './subscriptionProduct';
import subscriptionOrder from './subscriptionOrder';
import page from './page';
import savePost from './savedPostMutations';
import pollMutations from './pollMutations';

const Mutation = `
  extend type Mutation {
    ${categoryMutations}
    ${postMutations}
    ${commentMutations}
    ${voteMutations}
    ${followMutations}
    ${permissionGroup}
    ${subscriptionProduct}
    ${subscriptionOrder}
    ${pollMutations}
    ${page}
    ${savePost}
  }
`;

export default Mutation;
