import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { IRouterProps } from 'modules/common/types';
import { NotifProvider } from 'modules/notifications/context';
import Robot from 'modules/robot/containers/Robot';
import ImportIndicator from 'modules/settings/importHistory/containers/ImportIndicator';
import React from 'react';
import { withRouter } from 'react-router-dom';
import Navigation from '../containers/Navigation';
import { Layout, MainWrapper } from '../styles';
import DetectBrowser from './DetectBrowser';

const MainBar = asyncComponent(() =>
  import(/* webpackChunkName: "MainBar" */ 'modules/layout/components/MainBar')
);

interface IProps extends IRouterProps {
  currentUser?: IUser;
  children: React.ReactNode;
  isShownIndicator: boolean;
  closeLoadingBar: () => void;
}

class MainLayout extends React.Component<IProps> {
  componentDidMount() {
    const { history, currentUser } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }

    if (currentUser && process.env.NODE_ENV === 'production') {
      // Wootric code
      (window as any).wootricSettings = {
        email: currentUser.email, // Required to uniquely identify a user. Email is recommended but this can be any unique identifier.
        account_token: 'NPS-477ee032' // This is your unique account token.
      };

      const wootricScript = document.createElement('script');
      wootricScript.src = 'https://cdn.wootric.com/wootric-sdk.js';

      document.head.appendChild(wootricScript);

      wootricScript.onload = () => {
        (window as any).wootric('run');
      };
    }
  }

  getLastImport = () => {
    return localStorage.getItem('erxes_import_data') || '';
  };

  renderBackgroundProccess = () => {
    const { isShownIndicator, closeLoadingBar } = this.props;

    if (isShownIndicator) {
      return (
        <ImportIndicator id={this.getLastImport()} close={closeLoadingBar} />
      );
    }

    return null;
  };

  render() {
    const { currentUser, children, isShownIndicator, history } = this.props;

    if (history.location.pathname === '/videoCall') {
      return children;
    }

    return (
      <>
        {this.renderBackgroundProccess()}
        <Layout isSqueezed={isShownIndicator}>
          {currentUser && <Navigation currentUser={currentUser} />}

          <MainWrapper>
            <NotifProvider currentUser={currentUser}>
              <MainBar />
            </NotifProvider>

            {children}
          </MainWrapper>
          <DetectBrowser />
        </Layout>
        <Robot />
      </>
    );
  }
}

export default withRouter<IProps>(MainLayout);
