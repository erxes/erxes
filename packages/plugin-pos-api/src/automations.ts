import { IModels, generateModels } from './connectionResolver';
import { replacePlaceHolders } from '@erxes/api-utils/src/automations';

const getRelatedValue = async (
  _models: IModels,
  _subdomain: string,
  _target,
  _targetKey,
  _relatedValueProps?: any
) => {
  return null;
};

export default {
  constants: {
    triggers: [
      {
        type: 'pos:posOrder',
        img: 'automation3.svg',
        icon: 'lamp',
        label: 'Pos order',
        description:
          'Start with a blank workflow that enralls and is triggered off Pos orders'
      }
    ]
  },
  replacePlaceHolders: async ({
    subdomain,
    data: { target, config, relatedValueProps }
  }) => {
    const models = generateModels(subdomain);

    return await replacePlaceHolders({
      models,
      subdomain,
      getRelatedValue,
      actionData: config,
      target,
      relatedValueProps
    });
  }
};
