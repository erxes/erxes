import * as React from 'react';
import WebsiteAppDetail from '../../components/websiteApp/WebsiteAppDetail';
import { useRouter } from '../../context/Router';
import { getMessengerData } from '../../utils/util';

const WebsiteAppDetailContainer = ({ loading }: { loading: boolean }) => {
  const { setRoute, currentWebsiteApp } = useRouter();
  const websiteApp = (getMessengerData().websiteApps || []).find(
    (app) => app._id === currentWebsiteApp
  );

  if (!websiteApp) {
    return null;
  }

  return (
    <WebsiteAppDetail
      loading={loading}
      changeRoute={setRoute}
      websiteApp={websiteApp}
    />
  );
};

export default WebsiteAppDetailContainer;
