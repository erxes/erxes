import {
  IconAlertTriangle,
  IconBan,
  IconCircleCheck,
  IconCircleX,
  IconClock,
} from '@tabler/icons-react';
import { ApprovalRequestStatus, type IUser } from 'ui-modules';

/** One source of truth for how a request status is drawn, list or table. */
export const APPROVAL_REQUEST_STATUS_META: Record<
  ApprovalRequestStatus,
  {
    variant: 'success' | 'destructive' | 'secondary' | 'warning';
    icon: typeof IconClock;
  }
> = {
  pending: {
    variant: 'warning',
    icon: IconClock,
  },
  approved: {
    variant: 'success',
    icon: IconCircleCheck,
  },
  rejected: {
    variant: 'destructive',
    icon: IconCircleX,
  },
  // Agreed to, but the change it carried never happened — its own state, so a
  // decision nobody acted on is never listed as a done one.
  applyFailed: {
    variant: 'destructive',
    icon: IconAlertTriangle,
  },
  cancelled: {
    variant: 'secondary',
    icon: IconBan,
  },
};

export const getApprovalRequestUserName = (user?: IUser) => {
  const firstLastName = [user?.details?.firstName, user?.details?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    user?.details?.fullName ||
    firstLastName ||
    user?.email ||
    user?.username ||
    '-'
  );
};
