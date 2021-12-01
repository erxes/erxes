import exmFeedResolvers from '../resolvers/exmFeed';
import exmThankResolvers from '../resolvers/exmThank';

const resolvers = [...exmFeedResolvers, ...exmThankResolvers];

export default resolvers;
