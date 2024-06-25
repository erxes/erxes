import * as React from 'react';
import WebsiteApp from '../../components/websiteApp/WebsiteApp';
import { IWebsiteApp } from '../../types';
import { useAppContext } from '../AppContext';

type Props = {
  websiteApp: IWebsiteApp;
};

const Container = (props: Props) => {
  const { goToWebsiteApp, getColor } = useAppContext();

  return (
    <WebsiteApp {...props} goToWebsiteApp={goToWebsiteApp} color={getColor()} />
  );
};

export default Container;
