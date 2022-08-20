import * as React from 'react';
import WebsiteAppDetail from '../../components/websiteApp/WebsiteAppDetail';
import { AppConsumer } from '../AppContext';

const WebsiteAppDetailContainer = () => {
  return (
    <AppConsumer>
      {({ changeRoute, getMessengerData, currentWebsiteApp }) => {
        const websiteApp = (getMessengerData().websiteApps || []).find(
          app => app._id === currentWebsiteApp
        );

        if (!websiteApp) {
          return null;
        }

        return (
          <WebsiteAppDetail changeRoute={changeRoute} websiteApp={websiteApp} />
        );
      }}
    </AppConsumer>
  );
};

export default WebsiteAppDetailContainer;
