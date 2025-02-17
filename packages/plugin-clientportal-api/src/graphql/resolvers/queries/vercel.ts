import { IContext } from '../../../connectionResolver';
import {
  getDomains,
  getDomainConfig,
  getDeploymentEvents,
} from '../../../vercel/util';

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

    if (!config.vercelProjectId) {
      throw new Error('Has not been deployed to Vercel');
    }

    return getDomains(config.vercelProjectId);
  },

  async clientPortalGetVercelDomainConfig(
    _root,
    { domain }: { domain: string }
  ) {
    try {
      const config = await getDomainConfig(domain);
      if (!config.cnames || config.cnames.length === 0) {
        const domainParts = domain.split('.');
        if (domainParts.length > 2) {
          return {
            warning:
              'No configs found, Set the following record on your DNS provider to continue',
            value: 'cname.vercel-dns.com.',
            type: 'CNAME',
            name: domainParts[0],
          };
        }

        return {
          warning:
            'No configs found, Set the following record on your DNS provider to continue',
          value: '76.76.21.21',
          type: 'A',
          name: '@',
        };
      }
    } catch (e) {
      console.error(e);
      throw new Error(e);
    }
  },

  async clientPortalGetVercelDeploymentStatus(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    const config = await models.ClientPortals.findOne({ _id });

    if (!config || !config.lastVercelDeploymentId) {
      throw new Error('Config not found or has not been deployed to Vercel');
    }

    const events = await getDeploymentEvents(config.lastVercelDeploymentId);

    if (events.length === 0) {
      throw new Error('No events found');
    }

    const complete = events.find(
      (event) => event.text === 'Deployment completed'
    );

    if (complete) {
      return complete;
    }

    return events[events.length - 1];
  },
};

export default queries;
