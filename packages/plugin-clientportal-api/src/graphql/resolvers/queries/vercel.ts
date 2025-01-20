import { IContext } from '../../../connectionResolver';
import { getDomains } from '../../../vercel/util';

const queries = {
  async clientPortalGetVercelDomains(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    const config = await models.ClientPortals.findOne({ _id });
    if (!config) {
      throw new Error('Config not found');
    }

    console.log(config.vercelProjectId);
    console.log(config._id);

    if (!config.vercelProjectId) {
      throw new Error('Has not been deployed to Vercel');
    }
    
    return getDomains(config.vercelProjectId);
  },
};

export default queries;
