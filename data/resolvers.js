import { Conversations } from './connectors';

const resolveFunctions = {
  RootQuery: {
    conversations() {
      return Conversations.find({});
    },
  },
};

export default resolveFunctions;
