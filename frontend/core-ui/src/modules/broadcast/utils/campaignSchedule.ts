export type TCampaignSchedule = {
  runCount?: number;
  isDraft?: boolean;
  status?: string;
  scheduleDate?: {
    dateTime?: string | null;
    every?: string | null;
    endDate?: string | null;
  } | null;
};

/** Repeats, rather than waiting for a single moment. */
export const isRecurring = (campaign?: TCampaignSchedule | null) =>
  !!campaign?.scheduleDate?.every;

/** The moment a campaign is set to go out, if one was picked. */
export const scheduledAt = (campaign?: TCampaignSchedule | null) => {
  const at = campaign?.scheduleDate?.dateTime;

  return at ? new Date(at) : undefined;
};

/**
 * Waiting for its moment: a moment was picked, nobody has cancelled it back to
 * a draft, and it has not gone out yet.
 *
 * Whether that moment has arrived is a separate question — an alarm that never
 * went off leaves a campaign scheduled and overdue, which is a state someone
 * still has to be able to act on.
 */
export const isScheduled = (campaign?: TCampaignSchedule | null) => {
  if (campaign?.isDraft === true) {
    return false;
  }

  // A repeating campaign is still waiting between occurrences, however many
  // times it has already gone out.
  if (isRecurring(campaign)) {
    return campaign?.status !== 'sending';
  }

  return !!scheduledAt(campaign) && !campaign?.runCount;
};
