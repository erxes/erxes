import { Layout, MainWrapper } from '../styles';
import React, { useEffect, useState } from 'react';
import { bustIframe, getEnv } from 'modules/common/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import DetectBrowser from './DetectBrowser';
import { IUser } from 'modules/auth/types';
import Navigation from './navigation';
import asyncComponent from 'modules/common/components/AsyncComponent';

// import { withRouter } from 'react-router-dom';

const MainBar = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MainBar" */ 'modules/layout/components/MainBar'
    ),
);

interface IProps {
  currentUser?: IUser;
  children: React.ReactNode;
  isShownIndicator: boolean;
  enabledServices: any;
  closeLoadingBar: () => void;
}

function MainLayout({
  currentUser,
  children,
  isShownIndicator,
  enabledServices,
}: IProps) {
  const [navCollapse, setNavCollapse] = useState<number>(2);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== '/reset-password' && !currentUser) {
      navigate('/sign-in');
    }

    // if (currentUser && process.env.NODE_ENV === 'production') {
    if (currentUser) {
      // Wootric code
      (window as any).wootricSettings = {
        email: currentUser.email,
        created_at: Math.floor(
          (currentUser.createdAt
            ? new Date(currentUser.createdAt)
            : new Date()
          ).getTime() / 1000,
        ),
        account_token: 'NPS-477ee032', // This is your unique account token.
      };

      const wootricScript = document.createElement('script');
      wootricScript.src = 'https://cdn.wootric.com/wootric-sdk.js';

      document.head.appendChild(wootricScript);

      wootricScript.onload = () => {
        (window as any).wootric('run');
      };
    } // end currentUser checking

    const { REACT_APP_HIDE_MESSENGER } = getEnv();

    if (!REACT_APP_HIDE_MESSENGER) {
      const userDetail = (currentUser && currentUser.details) || {
        firstName: '',
        lastName: '',
      };
      (window as any).erxesSettings = {
        messenger: {
          brand_id: '5fkS4v',
          email: (currentUser && currentUser.email) || '',
          firstName: userDetail.firstName,
          lastName: userDetail.lastName,
        },
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
    setNavCollapse(navNumber ? parseInt(navNumber) : 2);

    // click-jack attack defense
    bustIframe();
  }, [location.pathname, currentUser, navigate]);

  const onClickHandleIcon = (type: string) => {
    let collapse;
    if (type === 'plus') {
      collapse = navCollapse + 1;
    } else {
      collapse = navCollapse - 1;
    }

    setNavCollapse(collapse);

    localStorage.setItem('navigationNumber', collapse.toString());
  };

  if (location.pathname.startsWith('/videoCall')) {
    return children;
  }

  return (
    <>
      <div id="anti-clickjack" style={{ display: 'none' }} />

      <Layout $isSqueezed={isShownIndicator}>
        <Navigation
          navCollapse={navCollapse}
          onClickHandleIcon={onClickHandleIcon}
        />

        <MainWrapper $navCollapse={navCollapse}>
          <MainBar />

          {children}
        </MainWrapper>
        <DetectBrowser />
      </Layout>
    </>
  );
}

export default MainLayout;
