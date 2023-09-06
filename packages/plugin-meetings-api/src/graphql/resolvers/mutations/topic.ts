import { IContext } from '../../../messageBroker';

const topicMutations = {
  // /**
  //  * Creates a new topic
  //  */
  async meetingTopicAdd(_root, doc, { models, user }: IContext) {
    return await models.Topics.createTopic(doc, user);
  },

  // /**
  //  * Edits a topic
  //  */
  async meetingTopicEdit(_root, doc, { models, user }: IContext) {
    return models.Topics.updateTopic(doc._id, doc, user);
  }
};

export default topicMutations;
