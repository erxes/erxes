import exmFeedQueries from '../resolvers/queries/exmFeed';
import exmThankQueries from '../resolvers/queries/exmThank';

const queries = [...exmFeedQueries, ...exmThankQueries];

export default queries;
