import { OnboardingHistories, RobotEntries } from '../../../db/models/Robot';
import { graphqlPubsub } from '../../../pubsub';
import { IContext } from '../../types';

const robotMutations = {
  robotEntriesMarkAsNotified(_root, { _id }: { _id: string }) {
    return RobotEntries.markAsNotified(_id);
  },

  async onboardingCheckStatus(_root, _args, { user }: IContext) {
    const status = await OnboardingHistories.userStatus(user._id);

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

  onboardingForceComplete(_root, _args, { user }: IContext) {
    return OnboardingHistories.forceComplete(user._id);
  },

  onboardingCompleteShowStep(
    _root,
    { step }: { step: string },
    { user }: IContext
  ) {
    return OnboardingHistories.completeShowStep(step, user._id);
  }
};

export default robotMutations;
