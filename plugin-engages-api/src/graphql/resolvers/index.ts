import customScalars from '@erxes/api-utils/src/customScalars';

import DeliveryReport from './deliveryReport';
import EngageMessage from './engageMessage';
import Mutation from './Mutation';
import Query from './Query';

const resolvers: any = {
  ...customScalars,

  DeliveryReport,
  EngageMessage,

  Mutation,
  Query
};

export default resolvers;
