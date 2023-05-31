import React, { useState } from 'react';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import { NotifButton } from '@erxes/ui-notifications/src/components/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { WidgetWrapper } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';

const WidgetContainer = () => {
  const [shrink, setShrink] = useState(false);
  const [show, setShow] = useState(true);

  const changeShrink = () => {
    setShrink(!shrink);
  };

  const hideWidget = () => {
    setTimeout(() => {
      setShow(true);
      setShrink(false);
    }, 10);

    localStorage.setItem('emailWidgetShow', 'false');
  };

  const showWidget = () => {
    setShrink(false);
    setShow(!show);
    if (show) {
      localStorage.setItem('emailWidgetShow', 'true');
    }
    if (!show) {
      localStorage.setItem('emailWidgetShow', 'false');
    }
  };

  const isWidgetShow = localStorage.getItem('emailWidgetShow');

  return (
    <>
      <NotifButton>
        <Icon icon="send" size={15} onClick={() => showWidget()} />
      </NotifButton>
      <WidgetWrapper show={isWidgetShow === 'true' ? true : false}>
        <MailForm
          shrink={shrink}
          hideWidget={hideWidget}
          isWidget={true}
          changeShrink={changeShrink}
        />
      </WidgetWrapper>
    </>
  );
};

export default WidgetContainer;
