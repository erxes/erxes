import { getConfig } from '../../../utils/utils';
import { IContext } from '../../../connectionResolver';
import { getObject, getPullPolaris } from '../../../utils/pullUtils';

const pullPolarisQueries = {
  async pullPolarisConfigs(_root, { contentType }: { contentType: string }, { models, subdomain }: IContext) {
    const polarisConfigs = await getConfig(subdomain, 'PULL_POLARIS', {});

    return polarisConfigs.filter(pc => pc.contentType === contentType);
  },

  async pullPolarisData(_root, { contentId, contentType, kind, codes }: { contentId: string, contentType: string, kind: string, codes: string[] }, { models, subdomain }: IContext) {
    const pullConfigs: any[] = await getConfig(subdomain, 'PULL_POLARIS', {}) || [];
    const polarisConfig: any[] = await getConfig(subdomain, 'POLARIS', {}) || [];

    const filteredConfigs = pullConfigs.filter(
      pc => pc.contentType === contentType && pc.kind === kind && codes.includes(pc.code)
    );

    const result: any[] = [];

    const object = await getObject(subdomain, contentId, contentType);

    for (const conf of filteredConfigs) {
      try{
        result.push({
          ...conf,
          response: await getPullPolaris(subdomain, polarisConfig, object, conf.code)
        });
      } catch (e) {
        
      }
    }
    return result;
  },
};

export default pullPolarisQueries;
