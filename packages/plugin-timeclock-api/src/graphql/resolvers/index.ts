import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { IContext } from '../../connectionResolver';

// const Timeclock = {
//   currentType(timeclock: ITemplateDocument, _args, { models }: IContext) {
//     return models.Types.findOne({ _id: timeclock.typeId });
//   }
// };

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  // Timeclock,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
