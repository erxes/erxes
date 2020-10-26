import * as React from 'react';
import { WebsiteApp } from '../../components';
import { IWebsiteApp } from '../../types';
import { AppConsumer } from '../AppContext';

type Props = {
  websiteApp: IWebsiteApp;
};

const container = (props: Props) => {
  return (
    <AppConsumer>
      {({ goToWebsiteApp, getColor }) => {
        return (
          <WebsiteApp
            {...props}
            goToWebsiteApp={goToWebsiteApp}
            color={getColor()}
          />
        );
      }}
    </AppConsumer>
  );
};

export default container;
