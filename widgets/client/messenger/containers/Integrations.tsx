import * as React from 'react';
import Integrations from '../components/Integrations';
import { connection } from '../connection';
import { getMessengerData } from '../utils/util';

const Container = () => {
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
