import {
  readTeamAvailabilitySettings,
  resolveMemberAvailability,
  TEAM_AVAILABILITY_CONFIG,
  TTeamAvailabilitySettings,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export const USER_SEGMENT_CONTENT_TYPE = 'core:organization.users';

export const loadTeamAvailabilitySettings = async (
  models: IModels,
): Promise<TTeamAvailabilitySettings> =>
  readTeamAvailabilitySettings(
    await models.Configs.getConfigValue(TEAM_AVAILABILITY_CONFIG, null),
  );

/** The linked segment must exist and be about team members. */
export const saveTeamAvailabilitySettings = async (
  models: IModels,
  input: TTeamAvailabilitySettings,
): Promise<TTeamAvailabilitySettings> => {
  const settings = readTeamAvailabilitySettings(input);

  if (settings.segmentId) {
    const segment = await models.Segments.findOne(
      { _id: settings.segmentId },
      { contentType: 1 },
    ).lean();

    if (!segment) {
      throw new Error('Segment not found');
    }

    if (segment.contentType !== USER_SEGMENT_CONTENT_TYPE) {
      throw new Error('Choose a team member segment');
    }
  }

  await models.Configs.createOrUpdateConfig({
    code: TEAM_AVAILABILITY_CONFIG,
    value: settings as unknown as string[],
  });

  return settings;
};

/** Settings with a removed segment treated as not linked. */
const loadEffectiveSettings = async (
  models: IModels,
): Promise<TTeamAvailabilitySettings> => {
  const settings = await loadTeamAvailabilitySettings(models);

  if (!settings.segmentId) {
    return settings;
  }

  return (await models.Segments.exists({ _id: settings.segmentId }))
    ? settings
    : { ...settings, segmentId: undefined };
};

// One settings read per request, however many members a list resolves.
const settingsByRequest = new WeakMap<object, Promise<TTeamAvailabilitySettings>>();

export const requestAvailabilitySettings = (request: object, models: IModels) => {
  const cached = settingsByRequest.get(request);

  if (cached) {
    return cached;
  }

  const loading = loadEffectiveSettings(models);
  settingsByRequest.set(request, loading);

  return loading;
};

/**
 * Whether each member takes new work now. A linked segment that was removed
 * counts as not linked, so declarations alone decide.
 */
export const resolveTeamAvailability = async (
  models: IModels,
  userIds: string[],
  now = new Date(),
) => {
  const effective = await loadEffectiveSettings(models);
  const users = await models.Users.find(
    { _id: { $in: userIds } },
    { isActive: 1, availability: 1, segmentIds: 1 },
  ).lean();

  return users.map((user) => ({
    _id: user._id,
    isActive: user.isActive !== false,
    ...resolveMemberAvailability(user, effective, now),
  }));
};
