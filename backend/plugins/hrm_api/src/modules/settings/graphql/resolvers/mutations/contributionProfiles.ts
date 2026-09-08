import { IContext } from '~/connectionResolvers';
import { ContributionProfileInput } from '../../../db/models/ContributionProfiles';
import { validateContributionProfileInput } from '../validators';

export const contributionProfileMutations = {
  async hrmContributionProfilesCreate(
    _root: undefined,
    { doc }: { doc: ContributionProfileInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.ContributionProfiles.createContributionProfile(
      validateContributionProfileInput(doc),
    );
  },

  async hrmContributionProfilesUpdate(
    _root: undefined,
    { _id, doc }: { _id: string; doc: ContributionProfileInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.ContributionProfiles.updateContributionProfile(
      _id,
      validateContributionProfileInput(doc),
    );
  },

  async hrmContributionProfilesArchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.ContributionProfiles.archiveContributionProfile(_id);
  },

  async hrmContributionProfilesRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsRemove');
    return models.ContributionProfiles.removeContributionProfile(_id);
  },
};
