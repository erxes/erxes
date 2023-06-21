import { Layout, MainWrapper } from '../styles';

import DetectBrowser from './DetectBrowser';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from 'modules/auth/types';
import Navigation from './navigation';
import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { bustIframe } from 'modules/common/utils';
import { withRouter } from 'react-router-dom';

const MainBar = asyncComponent(() =>
  import(/* webpackChunkName: "MainBar" */ 'modules/layout/components/MainBar')
);

interface IProps extends IRouterProps {
  currentUser?: IUser;
  children: React.ReactNode;
  isShownIndicator: boolean;
  enabledServices: any;
  closeLoadingBar: () => void;
}

type State = {
  navCollapse: number;
};

class MainLayout extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      navCollapse: 2
    };
  }

  componentDidMount() {
    const { history, currentUser, enabledServices } = this.props;

    if (history.location.pathname !== '/reset-password' && !currentUser) {
      history.push('/sign-in');
    }

    // if (currentUser && process.env.NODE_ENV === 'production') {
    if (currentUser) {
      // Wootric code
      (window as any).wootricSettings = {
        email: currentUser.email, // Required to uniquely identify a user. Email is recommended but this can be any unique identifier.
        created_at: Math.floor(
          (currentUser.createdAt
            ? new Date(currentUser.createdAt)
            : new Date()
          ).getTime() / 1000
        ),
        account_token: 'NPS-477ee032' // This is your unique account token.
      };

      const wootricScript = document.createElement('script');
      wootricScript.src = 'https://cdn.wootric.com/wootric-sdk.js';

      document.head.appendChild(wootricScript);

      wootricScript.onload = () => {
        (window as any).wootric('run');
      };
    } // end currentUser checking

    if (!(window as any).env.REACT_APP_HIDE_MESSENGER) {
      const userDetail = (currentUser && currentUser.details) || {
        firstName: '',
        lastName: ''
      };
      (window as any).erxesSettings = {
        messenger: {
          brand_id: '5fkS4v',
          email: (currentUser && currentUser.email) || '',
          firstName: userDetail.firstName,
          lastName: userDetail.lastName
        }
      };

      const script = document.createElement('script');
      script.src = 'https://w.office.erxes.io/build/messengerWidget.bundle.js';
      const entry = document.getElementsByTagName('script')[0];
      (entry as any).parentNode.insertBefore(script, entry);
    }

    if (enabledServices && Object.keys(enabledServices).length !== 0) {
      localStorage.setItem('enabledServices', JSON.stringify(enabledServices));
    }

    const navNumber = localStorage.getItem('navigationNumber');

    this.setState({ navCollapse: navNumber ? parseInt(navNumber) : 2 });

    // click-jack attack defense
    bustIframe();
  }

  onClickHandleIcon = (type: string) => {
    let collapse;
    if (type === 'plus') {
      collapse = this.state.navCollapse + 1;
    } else {
      collapse = this.state.navCollapse - 1;
    }

    this.setState({ navCollapse: collapse });

    localStorage.setItem('navigationNumber', collapse.toString());
  };

  getLastImport = () => {
    return localStorage.getItem('erxes_import_data') || '';
  };

  render() {
    const { children, isShownIndicator, history } = this.props;

    if (history.location.pathname.startsWith('/videoCall')) {
      return children;
    }

    return (
      <>
        <div id="anti-clickjack" style={{ display: 'none' }} />

        <Layout isSqueezed={isShownIndicator}>
          <Navigation
            navCollapse={this.state.navCollapse}
            onClickHandleIcon={this.onClickHandleIcon}
          />

          <MainWrapper navCollapse={this.state.navCollapse}>
            <MainBar />

            {children}
          </MainWrapper>
          <DetectBrowser />
        </Layout>
      </>
    );
  }
}

export default withRouter<IProps>(MainLayout);
