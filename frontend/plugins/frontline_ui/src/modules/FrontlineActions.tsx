import { InboxActions } from '@/inbox/components/InboxActions';
import { useLocation } from 'react-router-dom';

export const FrontlineActions = () => {
  const location = useLocation();

  if (!location.pathname.startsWith('/frontline/inbox')) {
    return null;
  }

  return <InboxActions />;
};
