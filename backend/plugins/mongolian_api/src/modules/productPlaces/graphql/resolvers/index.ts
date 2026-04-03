import { apolloCustomScalars } from "erxes-api-shared/utils";

const resolvers: any = async () => ({
  ...apolloCustomScalars,

  Query: {},

  Mutation: {},
});

export default resolvers;
