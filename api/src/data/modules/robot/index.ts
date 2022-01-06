import { OnboardingHistories } from '../../../db/models';
import { graphqlPubsub } from '../../../pubsub';
import { debugBase } from '../../../debuggers';

export const registerOnboardHistory = (type: string, user: any) =>
  OnboardingHistories.getOrCreate({ type, user })
    .then(({ status }) => {
      if (status === 'created') {
        graphqlPubsub.publish('onboardingChanged', {
          onboardingChanged: { userId: user._id, type }
        });
      }
    })
    .catch(e => debugBase(e));
