import type { DealNotificationBodyProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { Overview } from '@/deals/cards/components/detail/overview/Overview';

export const DealNotificationBody = ({ deal }: DealNotificationBodyProps) => (
  <div className="flex-1 py-4">
    <Overview deal={deal} />
  </div>
);
