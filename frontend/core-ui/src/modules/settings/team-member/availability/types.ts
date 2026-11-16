export type TAvailabilityStatus = 'available' | 'unavailable';

export interface IMemberAvailability {
  status?: TAvailabilityStatus | null;
  source?: 'manual' | 'segment' | 'default' | null;
  until?: string | null;
  reason?: string | null;
  declaredStatus?: TAvailabilityStatus | null;
  declaredUntil?: string | null;
  declaredReason?: string | null;
}

export interface ITeamAvailabilitySettings {
  segmentId?: string | null;
  precedence?: 'segment' | 'manual' | null;
}
