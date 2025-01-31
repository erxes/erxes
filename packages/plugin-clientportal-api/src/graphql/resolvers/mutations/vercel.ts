import { IContext, IModels } from '../../../connectionResolver';
import { IClientPortalDocument } from '../../../models/definitions/clientPortal';
import { clientPortal } from '../../../permissions';
import { addDomain, deploy, removeProject } from '../../../vercel/util';

const getConfig = async (_id: string, models: IModels) => {
  const config: IClientPortalDocument | null =
    await models.ClientPortals.findOne({
      $or: [{ _id: _id }, { vercelProjectId: _id }],
    });

  if (!config) {
    throw new Error('Config not found');
  }

  if (!config.vercelProjectId) {
    throw new Error('Has not been deployed to Vercel');
  }

  return config;
};

const mutations = {
  async clientPortalDeployVercel(
    _root,
    args: { _id },
    { subdomain, models }: IContext
  ) {
    const config = await models.ClientPortals.findOne({
      $or: [{ _id: args._id }, { vercelProjectId: args._id }],
    });

    if (!config) {
      throw new Error('Config not found');
    }

    const vercelResult = await deploy(subdomain, config);

    if (!vercelResult) {
      throw new Error('Could not deploy');
    }

    const update: any = {
      $set: {
        lastVercelDeploymentId: vercelResult.id,
      },
    };

    if (config.vercelProjectId) {
      update.$set.vercelProjectId = vercelResult.projectId;
    }

    await models.ClientPortals.updateOne({ _id: config._id }, update);

    return vercelResult;
  },

  async clientPortalRemoveVercel(_root, args: { _id }, { models }: IContext) {
    const config = await getConfig(args._id, models);

    await removeProject(config.vercelProjectId || '');

    await models.ClientPortals.updateOne(
      { _id: config._id },
      { $set: { vercelProjectId: null } }
    );

    return true;
  },

  async clientPortalAddDomainToVercel(
    _root,
    { _id, domain },
    { subdomain, models }: IContext
  ) {
    const config = await getConfig(_id, models);

    return addDomain(config.vercelProjectId || '', domain);
  },
};

export default mutations;
