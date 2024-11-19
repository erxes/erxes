import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { getLocalStorageItem } from '../../common';
import { connection } from '../connection';
import { IFaqArticle, IFaqCategory } from '../types';
import { useConfig } from './Config';

const RouterContext = createContext<any>(null);

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeRoute, setActiveRoute] = useState('home');
  const [isSmallContainer, setIsSmallContainer] = useState(false);
  const [activeFaqArticle, setActiveFaqArticle] = useState<IFaqArticle | null>(
    null
  );
  const [activeFaqCategory, setActiveFaqCategory] =
    useState<IFaqCategory | null>(null);
  const [currentWebsiteApp, setCurrentWebsiteApp] = useState('');

  const { setIsInputDisabled, setSelectedSkill, isLoggedIn } = useConfig();

  useEffect(() => {
    const { messengerData } = connection.data;
    const { requireAuth, showChat } = messengerData;

    handleAuthentication(requireAuth);
    handleChatVisibility(requireAuth, showChat);
  }, []);

  useEffect(() => {
    if (activeRoute === 'accquireInformation') {
      setIsSmallContainer(true);
    } else {
      setIsSmallContainer(false);
    }
  }, [activeRoute]);

  const handleAuthentication = (requireAuth: boolean) => {
    if (!isLoggedIn() && requireAuth) {
      // setActiveRoute('acquireInformation');
      setActiveRoute('home');
    }
  };

  const handleChatVisibility = (requireAuth: boolean, showChat: boolean) => {
    if ((!requireAuth && !getLocalStorageItem('hasNotified')) || !showChat) {
      setActiveRoute('home');
    }
  };

  const setRoute = (routePath: string) => {
    if (routePath) {
      if (shouldAcquireInformation(routePath)) {
        setActiveRoute('acquireInformation');
        setSelectedSkill('');
        return;
      }

      handleRouteChange(routePath);
    }
  };

  const shouldAcquireInformation = (routePath: string) => {
    return (
      activeRoute === 'conversationDetail' &&
      !isLoggedIn() &&
      connection.data.messengerData.requireAuth
    );
  };

  const handleRouteChange = (routePath: string) => {
    const { skillData = {} } = connection.data.messengerData;
    const { options = [] } = skillData;

    setActiveRoute(routePath);
    setSelectedSkill('');
    setIsInputDisabled(options.length > 0);
  };

  const goToFaqArticle = (article: IFaqArticle) => {
    setRoute('faqArticle');
    setActiveFaqArticle(article);
  };

  const goToFaqCategory = (category?: IFaqCategory) => {
    if (category) {
      setActiveFaqCategory(category);
    }
    setRoute(
      activeFaqCategory || category ? 'faqCategory' : 'conversationList'
    );
  };

  const goToHome = () => {
    setActiveRoute('home');
  };

  const goToWebsiteApp = (id: string) => {
    setCurrentWebsiteApp(id);
    setRoute('websiteApp');
  };

  return (
    <RouterContext.Provider
      value={{
        activeRoute,
        activeFaqArticle,
        activeFaqCategory,
        setActiveRoute,
        setRoute,
        isSmallContainer,
        currentWebsiteApp,
        goToFaqArticle,
        goToHome,
        goToFaqCategory,
        goToWebsiteApp,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);
