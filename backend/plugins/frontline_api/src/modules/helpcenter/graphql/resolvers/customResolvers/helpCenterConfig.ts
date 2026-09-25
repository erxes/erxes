import { IHelpCenterConfigDocument } from '@/helpcenter/@types/helpCenterConfig';
import { IContext } from '~/connectionResolvers';

export const HelpCenterConfig = {
  brand(config: IHelpCenterConfigDocument) {
    if (!config.brandId) {
      return null;
    }

    return {
      __typename: 'Brand',
      _id: config.brandId,
    };
  },

  async kbTopic(
    config: IHelpCenterConfigDocument,
    _args,
    { models }: IContext,
  ) {
    if (!config.kbTopicId) {
      return null;
    }

    return models.Topic.findOne({ _id: config.kbTopicId });
  },
};
