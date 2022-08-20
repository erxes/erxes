import { Ebarimt as EbarimtQueries } from './queries';

const resolvers: any = async () => ({
  Query: {
    ...EbarimtQueries
  }
});

export default resolvers;
