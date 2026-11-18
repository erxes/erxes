import type { IUserAvailability } from '../../core-types/modules/team-member/user';

export type TAvailabilityStatus = 'available' | 'unavailable';
export type TAvailabilitySource = 'manual' | 'segment' | 'default';

export const TEAM_AVAILABILITY_CONFIG = 'TEAM_AVAILABILITY';

export type TTeamAvailabilitySettings = {
  // Members of this team member segment are unavailable.
  segmentId?: string;
  // Which side wins when a declaration and the segment disagree.
  precedence?: 'segment' | 'manual';
};

export type TMemberAvailability = {
  status: TAvailabilityStatus;
  source: TAvailabilitySource;
  until?: Date;
  reason?: string;
};

type TAvailabilityHolder = {
  availability?: IUserAvailability | null;
  segmentIds?: string[] | null;
};

/** A declaration past its `until` counts as not declared. */
const declaredOf = (
  availability: IUserAvailability | null | undefined,
  now: Date,
) => {
  if (!availability?.status) {
    return undefined;
  }

  if (availability.until && new Date(availability.until) <= now) {
    return undefined;
  }

  return availability;
};

export const readTeamAvailabilitySettings = (
  value: unknown,
): TTeamAvailabilitySettings => {
  const settings =
    value && typeof value === 'object' ? (value as TTeamAvailabilitySettings) : {};

  return {
    segmentId:
      typeof settings.segmentId === 'string' && settings.segmentId.trim()
        ? settings.segmentId.trim()
        : undefined,
    precedence: settings.precedence === 'manual' ? 'manual' : 'segment',
  };
};

/**
 * Whether a member takes new work now: a declaration, a segment the company
 * linked, or available when neither speaks. When both speak and disagree, the
 * company's precedence decides.
 */
export const resolveMemberAvailability = (
  member: TAvailabilityHolder,
  settings: TTeamAvailabilitySettings,
  now = new Date(),
): TMemberAvailability => {
  const declared = declaredOf(member.availability, now);
  const segmentStatus: TAvailabilityStatus | undefined = settings.segmentId
    ? (member.segmentIds || []).includes(settings.segmentId)
      ? 'unavailable'
      : 'available'
    : undefined;
  const manual: TMemberAvailability | undefined = declared?.status
    ? {
        status: declared.status,
        source: 'manual',
        until: declared.until,
        reason: declared.reason,
      }
    : undefined;
  const segment: TMemberAvailability | undefined = segmentStatus
    ? { status: segmentStatus, source: 'segment' }
    : undefined;

  if (manual && segment && manual.status !== segment.status) {
    return settings.precedence === 'manual' ? manual : segment;
  }

  return manual || segment || { status: 'available', source: 'default' };
};
