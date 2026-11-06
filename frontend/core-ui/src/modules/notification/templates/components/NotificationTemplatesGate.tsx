import { Navigate } from 'react-router-dom';
import { Can } from 'ui-modules';

/** Workspace email settings, for those allowed to change them. */
export const NotificationTemplatesGate = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Can
    action="notificationTemplatesManage"
    fallback={<Navigate to="/settings/notification" replace />}
  >
    {children}
  </Can>
);
