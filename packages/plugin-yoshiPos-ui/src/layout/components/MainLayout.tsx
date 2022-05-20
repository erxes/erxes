import { IUser } from '../../auth/types';
import { IRouterProps, IConfig } from '../../types';
import { bustIframe } from '../../common/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout, MainWrapper, PortraitWrapper } from '../styles';
import DetectBrowser from './DetectBrowser';
import { setHeader } from '../../utils';
import { POS_MODES } from '../../constants';

interface IProps extends IRouterProps {
  posCurrentUser?: IUser;
  currentConfig?: IConfig;
  orientation: string;
  children: React.ReactNode;
}

class MainLayout extends React.Component<IProps> {
  componentDidMount() {
    const { history, posCurrentUser, currentConfig } = this.props;

    if (history.location.pathname !== '/reset-password' && !posCurrentUser) {
      history.push('/sign-in');
    }

    // click-jack attack defense
    bustIframe();
    setHeader(currentConfig || ({} as IConfig));
  }

  componentDidUpdate() {
    setHeader(this.props.currentConfig || ({} as IConfig));
  }

  render() {
    const { children, location } = this.props;

    if (
      [POS_MODES.KIOSK, POS_MODES.WAITING].includes(
        localStorage.getItem('erxesPosMode') || ''
      ) ||
      location.pathname.includes('waiting-screen')
    ) {
      return (
        <>
          <div id="anti-clickjack" style={{ display: 'none' }} />
          <Layout>
            <PortraitWrapper>{children}</PortraitWrapper>
            <DetectBrowser />
          </Layout>
        </>
      );
    }

    return (
      <>
        <div id="anti-clickjack" style={{ display: 'none' }} />
        <Layout>
          <MainWrapper className="main-wrapper">{children}</MainWrapper>
          <DetectBrowser />
        </Layout>
      </>
    );
  }
}

export default withRouter(MainLayout);
