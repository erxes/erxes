import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';

export const buildClosedAtFilter = ({
  closedAtFrom,
  closedAtTo,
}: {
  closedAtFrom?: string;
  closedAtTo?: string;
}) => {
  if (!closedAtFrom && !closedAtTo) return {};

  const range = {
    ...(closedAtFrom ? { $gte: new Date(closedAtFrom) } : {}),
    ...(closedAtTo ? { $lte: new Date(closedAtTo) } : {}),
  };

  if (Object.values(range).some((date) => Number.isNaN(date.getTime()))) {
    throw new Error('Invalid closed at date range');
  }
  if (range.$gte && range.$lte && range.$gte > range.$lte) {
    throw new Error('The closed at start date must precede the end date');
  }

  return {
    closedAt: range,
    $expr: { $eq: ['$status', CONVERSATION_STATUSES.CLOSED] },
  };
};
