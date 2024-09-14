import * as React from 'react';
import WebsiteApp from '../../components/websiteApp/WebsiteApp';
import { IWebsiteApp } from '../../types';
import { getColor } from '../../utils/util';
import { useRouter } from '../../context/Router';

type Props = {
  websiteApp: IWebsiteApp;
};

const Container = (props: Props) => {
  const { goToWebsiteApp } = useRouter();
  return (
    <WebsiteApp {...props} goToWebsiteApp={goToWebsiteApp} color={getColor()} />
  );
};

export default Container;
