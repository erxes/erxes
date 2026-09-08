import { IContext } from '~/connectionResolvers';
import {
  ContributionProfileListParams,
  contributionProfileSelector,
} from '../../../db/models/ContributionProfiles';
import { pager } from '../utils';

export const contributionProfileQueries = {
  async hrmContributionProfileDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.ContributionProfiles.getContributionProfile(_id);
  },

  async hrmContributionProfileByCode(
    _root: undefined,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.ContributionProfiles.getContributionProfileByCode(code);
  },

  async hrmContributionProfiles(
    _root: undefined,
    params: ContributionProfileListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    const pagination = pager(params);

    return models.ContributionProfiles.find(contributionProfileSelector(params))
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
  },

  async hrmContributionProfilesCount(
    _root: undefined,
    params: ContributionProfileListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.ContributionProfiles.find(
      contributionProfileSelector(params),
    ).countDocuments();
  },
};
