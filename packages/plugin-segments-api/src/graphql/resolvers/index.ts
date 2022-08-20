import customScalars from "@erxes/api-utils/src/customScalars";
import Segment from "./segments";

import { Segments as Mutations } from "./mutations";

import { Segments as Queries } from "./queries";

const resolvers: any = async () => ({
  ...customScalars,
  Segment,
  Mutation: {
    ...Mutations,
  },
  Query: {
    ...Queries,
  },
});

export default resolvers;
