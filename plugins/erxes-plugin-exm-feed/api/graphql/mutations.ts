import exmFeedMutations from '../resolvers/mutations/exmFeed';
import exmThankMutations from '../resolvers/mutations/exmThank';

const mutations = [...exmFeedMutations, ...exmThankMutations];

export default mutations;
