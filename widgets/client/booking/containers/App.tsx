import * as React from 'react';
import { useEffect, useState } from 'react';
import DumbApp from '../components/App';
import { AppProvider, useAppContext } from './AppContext';
import { connection } from '../connection';
import { saveBrowserInfo } from './utils';
import { connection as formConnection } from '../../form/connection';
import { IIntegration } from '../../types';
import { setLocale } from '../../utils';
import '../sass/style.min.css';

type Props = {
  isPopupVisible: boolean;
  activeRoute: string;
  isFormVisible: boolean;
  closePopup: () => void;
  integration: IIntegration;
  showPopup: () => void;
};

const AppContainer: React.FC<{ isTransationsLoaded: boolean }> = () => {
  const {
    activeRoute,
    isFormVisible,
    isPopupVisible,
    showPopup,
    closePopup,
    getIntegration,
  } = useAppContext();

  const [isTransationsLoaded, setIsTransationsLoaded] = useState(false);

  const integration = getIntegration();

  useEffect(() => {
    saveBrowserInfo();
    setLocale(connection.data.integration.languageCode, () => {
      setIsTransationsLoaded(true);
    });
  }, []);

  if (!isTransationsLoaded) {
    return null;
  }

  const booking = integration.bookingData || {};
  connection.data.booking = booking;
  formConnection.data.form = integration.formId;

  const loadType = 'popup';

  let parentClass;
  let containerClass = '';

  if (loadType) {
    if (isPopupVisible) {
      parentClass = 'erxes-modal-iframe';
      containerClass = 'modal-form open';
    } else {
      parentClass = 'erxes-modal-iframe hidden';
    }
  }

  const extendedProps = {
    activeRoute,
    isFormVisible,
    booking,
    containerClass,
    closePopup,
  };

  return (
    <AppProvider>
      <DumbApp {...extendedProps} />
    </AppProvider>
  );
};

export default AppContainer;
