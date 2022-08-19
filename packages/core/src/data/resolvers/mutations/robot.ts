import { graphqlPubsub } from '../../../pubsub';
import { IContext } from '../../../connectionResolver';

const robotMutations = {
  robotEntriesMarkAsNotified(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.RobotEntries.markAsNotified(_id);
  },

  async onboardingCheckStatus(_root, _args, { user, models }: IContext) {
    const status = await models.OnboardingHistories.userStatus(user._id);

    if (status !== 'completed') {
      graphqlPubsub.publish('onboardingChanged', {
        onboardingChanged: {
          userId: user._id,
          type: status
        }
      });
    }

    return status;
  },

  onboardingForceComplete(_root, _args, { user, models }: IContext) {
    return models.OnboardingHistories.forceComplete(user._id);
  },

  onboardingCompleteShowStep(
    _root,
    { step }: { step: string },
    { user, models }: IContext
  ) {
    return models.OnboardingHistories.completeShowStep(step, user._id);
  }
};

export default robotMutations;
