import { useLocation } from 'react-router';
import { ChannelAdd } from './channels/ChannelAdd';

export const InboxSettingsTopbar = () => {
  const { pathname } = useLocation();
  if (pathname.includes('channels')) {
    return <ChannelAdd />;
  }
  return null;
};
