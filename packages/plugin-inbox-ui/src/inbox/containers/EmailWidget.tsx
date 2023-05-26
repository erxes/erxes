import React, { useState, useRef } from 'react';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { NotifButton } from '@erxes/ui-notifications/src/components/styles';
import Popover from 'react-bootstrap/Popover';
import Icon from '@erxes/ui/src/components/Icon';

const WidgetContainer = () => {
  const [shrink, setShrink] = useState(false);
  const [show, setShow] = useState(true);
  const ref = useRef(null);

  const changeShrink = () => {
    setShrink(!shrink);
  };

  const hideWidget = () => {
    setShow(false);
    setTimeout(() => {
      ref.current.click();
      setShow(true);
      setShrink(false);
    }, 10);
  };

  const renderData = () => {
    return (
      <Popover
        id="email-popover"
        className={`email-popover ${shrink && 'small'}`}
      >
        {' '}
        <MailForm
          shrink={shrink}
          hideWidget={hideWidget}
          isWidget={true}
          changeShrink={changeShrink}
        />
      </Popover>
    );
  };

  return (
    <>
      <div ref={ref} />
      <OverlayTrigger
        trigger="click"
        rootClose={show ? false : true}
        placement="bottom"
        overlay={renderData()}
      >
        <NotifButton>
          <Icon icon="fast-mail" size={20} />
        </NotifButton>
      </OverlayTrigger>
    </>
  );
};

export default WidgetContainer;
