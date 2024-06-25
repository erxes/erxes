import * as React from 'react';
import Integrations from '../components/Integrations';
import { connection } from '../connection';
import { useAppContext } from './AppContext';

const Container = () => {
  const { getMessengerData } = useAppContext();
  const { formCodes, showChat, websiteApps } = getMessengerData();

  return (
    <Integrations
      brandCode={connection.setting.brand_id}
      formCodes={formCodes}
      websiteApps={websiteApps}
      hideConversations={!showChat}
    />
  );
};

export default Container;
