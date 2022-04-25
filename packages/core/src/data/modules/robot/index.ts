import { graphqlPubsub } from '../../../pubsub';
import { debugBase } from '../../../debuggers';
import { IModels } from '../../../connectionResolver';

export const registerOnboardHistory = (models: IModels, type: string, user: any) =>
  models.OnboardingHistories.getOrCreate({ type, user })
    .then(({ status }) => {
      if (status === 'created') {
        graphqlPubsub.publish('onboardingChanged', {
          onboardingChanged: { userId: user._id, type }
        });
      }
    })
    .catch(e => debugBase(e));
