import {
  coreModelExperiences,
  coreModelOrganizations,
} from '@erxes/api-utils/src/saas/saas';
import { IContext } from '../../../connectionResolver';

const organizationsQueries = {
  async getOnboardingSteps(_root, _params, { subdomain }: IContext) {
    const organization = await coreModelOrganizations.findOne({ subdomain });
    let experience = {} as any;

    if (!organization) {
      throw new Error('Organization not found');
    }

    if (organization.experienceId) {
      experience = await coreModelExperiences.findOne({
        _id: organization.experienceId,
      });
    }

    return experience.onboardingSteps || [];
  },
};

export default organizationsQueries;
