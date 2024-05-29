import { getPlugins } from '@erxes/api-utils/src/saas/saas';

interface IPluginParams {
  mainType?: string;
}

const pluginQueries = {
  savedPlugins(_root, { mainType }: IPluginParams) {
    const filter: any = {};

    if (mainType) {
      filter.mainType = { $in: [mainType] };
    }

    return getPlugins(filter);
  },
};

export default pluginQueries;
