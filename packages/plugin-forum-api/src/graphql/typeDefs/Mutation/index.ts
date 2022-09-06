import categoryMutations from './categoryMutations';
import postMutations from './postMutations';
import commentMutations from './commentMutations';
import voteMutations from './voteMutations';

const Mutation = `
  extend type Mutation {
    ${categoryMutations}
    ${postMutations}
    ${commentMutations}
    ${voteMutations}
  }
`;

export default Mutation;
