import { coreModelOrganizations } from "@erxes/api-utils/src/saas/saas";
import { IContext } from "../../../connectionResolver";

const organizationsMutations = {
  /**
   * Create new organizations
   */
  async organizationOnboardingDone(_root, _params, { subdomain }: IContext) {
    return coreModelOrganizations.updateOne(
      { subdomain },
      { $set: { onboardingDone: true } }
    );
  }
};

export default organizationsMutations;
