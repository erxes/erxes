import categoryMutations from './categoryMutations';
import postMutations from './postMutations';

const Mutation = `

  extend type Mutation {
    ${categoryMutations}
    ${postMutations}
  }
`;

export default Mutation;
