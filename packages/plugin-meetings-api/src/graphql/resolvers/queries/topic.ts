import { IContext } from '../../../messageBroker';

const topicQueries = {
  topics(_root, { typeId }, { models }: IContext) {
    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return models.Meetings.getMeetings();
  }
};

export default topicQueries;
