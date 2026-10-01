/** The re-enrollment rule that matches every new event, not a field change. */
export const AUTOMATION_RE_ENROLL_EVERY_TIME = '*';

type TReEnrollmentConfig = {
  reEnrollment?: boolean;
  reEnrollmentRules?: string[];
  once?: boolean;
} | null;

/** Whether a trigger's config asks to run again on every event. */
export const reEnrollsEveryTime = (config?: TReEnrollmentConfig) =>
  !!config?.reEnrollment &&
  !!config.reEnrollmentRules?.includes(AUTOMATION_RE_ENROLL_EVERY_TIME);

/**
 * Segment membership runs every time unless told otherwise. Before the shared
 * re-enrollment setting it was told with `once`, which still counts while the
 * automation has not been saved with the new setting.
 */
export const segmentMembershipRunsEveryTime = (config?: TReEnrollmentConfig) =>
  config?.reEnrollment === undefined
    ? !config?.once
    : reEnrollsEveryTime(config);
