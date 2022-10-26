import categoryMutations from './categoryMutations';
import postMutations from './postMutations';
import commentMutations from './commentMutations';
import voteMutations from './voteMutations';
import followMutations from './followMutations';

const Mutation = `
  extend type Mutation {
    ${categoryMutations}
    ${postMutations}
    ${commentMutations}
    ${voteMutations}
    ${followMutations}
  }
`;

export default Mutation;
