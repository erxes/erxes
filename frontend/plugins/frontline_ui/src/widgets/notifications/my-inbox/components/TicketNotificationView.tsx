import type { TicketNotificationViewProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';
import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { TicketOpenButton } from '~/widgets/notifications/my-inbox/components/TicketOpenButton';

export const TicketNotificationView = ({
  contentTypeId,
}: TicketNotificationViewProps) => (
  <div className="min-h-full w-full">
    <TicketDetailSheet />
    <div className="mx-auto w-full max-w-3xl p-6">
      <TicketDetails
        ticketId={contentTypeId}
        titleAction={<TicketOpenButton contentTypeId={contentTypeId} />}
      />
    </div>
  </div>
);
