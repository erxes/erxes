import { IConfig } from '../../models/definitions/goals';
import { graphqlPubsub } from '../../configs';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const goalMutations = {
  /**
   * Save goal configuration
   */
  goalsSaveConfig(_root, doc: IConfig, { user, models }: IContext) {
    return models.GoalConfigurations.createOrUpdateConfiguration(doc, user);
  },

  /**
   * Marks goal as read
   */
  async goalsMarkAsRead(
    _root,
    { _ids, contentTypeId }: { _ids: string[]; contentTypeId: string },
    { models, user }: IContext
  ) {
    // notify subscription
    graphqlPubsub.publish('goalsChanged', '');

    graphqlPubsub.publish('goalRead', {
      goalRead: { userId: user._id }
    });

    let goalIds = _ids;

    if (contentTypeId) {
      const goals = await models.Goals.find({ contentTypeId });

      goalIds = goals.map(goal => goal._id);
    }

    return models.Goals.markAsRead(goalIds, user._id);
  },

  /**
   * Show goals
   */
  async goalsShow(_root, _args, { user, subdomain }: IContext) {
    graphqlPubsub.publish('userChanged', {
      userChanged: { userId: user._id }
    });

    await sendCoreMessage({
      subdomain,
      action: 'users.updateOne',
      data: {
        selector: { _id: user._id },
        modifier: { $set: { isShowGoal: true } }
      }
    });

    return 'success';
  }
};

moduleRequireLogin(goalMutations);

export default goalMutations;
