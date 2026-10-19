import type { TicketNotificationViewProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';
import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { TicketOpenButton } from '~/widgets/notifications/my-inbox/components/TicketOpenButton';

export const TicketNotificationView = ({
  contentTypeId,
}: TicketNotificationViewProps) => (
  <div className="h-full w-full overflow-auto">
    <TicketDetailSheet />
    <div className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-4 flex justify-end">
        <TicketOpenButton contentTypeId={contentTypeId} />
      </div>
      <TicketDetails ticketId={contentTypeId} />
    </div>
  </div>
);
