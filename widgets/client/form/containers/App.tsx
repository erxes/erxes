import * as React from 'react';
import { useEffect } from 'react';
import DumbApp from '../components/App';
import { connection } from '../connection';
import { postMessage, saveBrowserInfo } from './utils';
import '../sass/style.min.css';
import { useAppContext } from './AppContext';

const App = () => {
  const {
    init,
    closePopup,
    showPopup,
    isPopupVisible,
    isFormVisible,
    isCalloutVisible,
    setHeight,
    getIntegrationConfigs,
    setCallSubmit,
    setExtraContent,
    onChangeCurrentStatus,
  } = useAppContext();

  const loadType = getIntegrationConfigs().loadType;

  useEffect(() => {
    saveBrowserInfo();

    const handleMessage = (event: MessageEvent) => {
      const {
        fromPublisher,
        fromPayment,
        message,
        action,
        formId,
        html,
        invoice,
      } = event.data;

      if (fromPublisher) {
        if (message === 'sendingBrowserInfo') {
          init();
        }

        if (formId === connection.setting.form_id) {
          if (action === 'showPopup') {
            showPopup();
          }

          if (action === 'callSubmit') {
            setCallSubmit(true);
          }

          if (action === 'extraFormContent') {
            setExtraContent(html);
          }
        }
      }

      if (fromPayment && message === 'paymentSuccessfull') {
        onChangeCurrentStatus('SUCCESS');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    init,
    showPopup,
    setCallSubmit,
    setExtraContent,
    onChangeCurrentStatus,
    connection,
  ]);

  useEffect(() => {
    setHeight();
  }, [setHeight]);

  let parentClass;
  let containerClass = '';

  const extendedProps = {
    init,
    closePopup,
    showPopup,
    isPopupVisible,
    isFormVisible,
    isCalloutVisible,
    setHeight,
    getIntegrationConfigs,
    setCallSubmit,
    setExtraContent,
    onChangeCurrentStatus,
    loadType,
    containerClass,
  };

  if (loadType === 'popup') {
    if (isPopupVisible) {
      parentClass = 'erxes-modal-iframe';
      containerClass = 'modal-form open';
    } else {
      parentClass = 'erxes-modal-iframe hidden';
      containerClass = 'modal-form';
    }
  }

  if (loadType === 'slideInLeft') {
    parentClass = 'erxes-slide-left-iframe';
    containerClass = 'container-slide-in-left';
  }

  if (loadType === 'slideInRight') {
    parentClass = 'erxes-slide-right-iframe';
    containerClass = 'container-slide-in-right';
  }

  if (loadType === 'dropdown') {
    parentClass = 'erxes-dropdown-iframe';
    containerClass = 'container-dropdown';

    if (isCalloutVisible) {
      containerClass += ' call-out';
    }
  }

  if (loadType === 'embedded') {
    parentClass = 'erxes-embedded-iframe';
    containerClass = 'container-embedded';
  }

  if (loadType === 'shoutbox') {
    if (isCalloutVisible || isFormVisible) {
      parentClass = 'erxes-shoutbox-iframe';
    } else {
      parentClass = 'erxes-shoutbox-iframe erxes-hidden';
    }

    containerClass = 'container-shoutbox';
  }

  postMessage({
    message: 'changeContainerClass',
    className: parentClass,
  });

  extendedProps.containerClass = containerClass;

  return <DumbApp {...extendedProps} />;
};

export default App;
