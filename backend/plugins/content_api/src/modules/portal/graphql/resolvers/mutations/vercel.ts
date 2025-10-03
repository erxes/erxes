import { IContext, IModels } from '~/connectionResolvers';
import { IPortalDocument } from '@/portal/@types/portal';
import { addDomain, deploy, removeProject } from '@/portal/utils/vercel';


const getConfig = async (_id: string, models: IModels) => {
  const config: IPortalDocument | null = await models.Portals.findOne({
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
  async clientPortalDeployVercel(_root, args: { _id }, { models, subdomain }: IContext) {
    const config = await models.Portals.findOne({
      $or: [{ _id: args._id }, { vercelProjectId: args._id }],
    });

    if (!config) {
      throw new Error('Config not found');
    }

    if (!subdomain) {
      throw new Error('Subdomain is required');
    }

    const vercelResult = await deploy(models, subdomain, config);

    if (!vercelResult) {
      throw new Error('Could not deploy');
    }

    const update: any = {
      $set: {
        lastVercelDeploymentId: vercelResult.id,
      },
    };

    if (!config.vercelProjectId) {
      update.$set.vercelProjectId = vercelResult.projectId;
    }

    await models.Portals.updateOne({ _id: config._id }, update);

    return vercelResult;
  },

  async clientPortalRemoveVercel(_root, args: { _id }, { models }: IContext) {
    const config = await getConfig(args._id, models);

    await removeProject(config.vercelProjectId || '');

    await models.Portals.updateOne(
      { _id: config._id },
      { $set: { vercelProjectId: null } },
    );

    return true;
  },

  async clientPortalAddDomainToVercel(
    _root,
    { _id, domain },
    { models }: IContext,
  ) {
    const config = await getConfig(_id, models);

    return addDomain(config.vercelProjectId || '', domain);
  },
};

export default mutations;
