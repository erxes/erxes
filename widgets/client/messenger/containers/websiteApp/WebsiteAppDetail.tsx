import * as React from 'react';
import WebsiteAppDetail from '../../components/websiteApp/WebsiteAppDetail';
import { useAppContext } from '../AppContext';

const WebsiteAppDetailContainer = () => {
  const { changeRoute, getMessengerData, currentWebsiteApp } = useAppContext();

  const websiteApp = (getMessengerData().websiteApps || []).find(
    (app) => app._id === currentWebsiteApp
  );

  if (!websiteApp) {
    return null;
  }

  return <WebsiteAppDetail changeRoute={changeRoute} websiteApp={websiteApp} />;
};

export default WebsiteAppDetailContainer;
