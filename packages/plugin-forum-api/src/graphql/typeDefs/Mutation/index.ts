import categoryMutations from './categoryMutations';
import postMutations from './postMutations';
import commentMutations from './commentMutations';
const Mutation = `

  extend type Mutation {
    ${categoryMutations}
    ${postMutations}
    ${commentMutations}
  }
`;

export default Mutation;
