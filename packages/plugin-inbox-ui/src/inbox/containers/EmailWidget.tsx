import React, { useState } from 'react';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import { NotifButton } from '@erxes/ui-notifications/src/components/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { WidgetWrapper } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { NewEmailHeader } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';

const WidgetContainer = () => {
  const [shrink, setShrink] = useState(
    localStorage.getItem('emailWidgetShrink') || 'false'
  );
  const [show, setShow] = useState(true);
  const [clear, setClear] = useState(false);

  const changeShrink = () => {
    setShrink(shrink === 'true' ? 'false' : 'true');
    localStorage.setItem(
      'emailWidgetShrink',
      shrink === 'true' ? 'false' : 'true'
    );
  };

  const hideWidget = () => {
    setTimeout(() => {
      setShow(true);
      setShrink('false');
      localStorage.setItem('emailWidgetShrink', 'false');
    }, 10);

    localStorage.setItem('emailWidgetShow', 'false');
  };

  const onClose = () => {
    hideWidget();
    setClear(true);
  };

  const showWidget = () => {
    setShrink('false');
    setShow(!show);
    setClear(false);

    localStorage.setItem('emailWidgetShrink', 'false');
    localStorage.setItem('emailWidgetShow', show ? 'true' : 'false');
  };

  const isWidgetShow = localStorage.getItem('emailWidgetShow');
  const isShrink = shrink === 'true' ? true : false;

  return (
    <>
      <NotifButton>
        <Tip text={__('New Email')} placement="bottom">
          <Icon icon="envelope-alt" size={20} onClick={() => showWidget()} />
        </Tip>
      </NotifButton>
      <WidgetWrapper show={isWidgetShow === 'true' ? true : false}>
        <NewEmailHeader shrink={isShrink} onClick={changeShrink}>
          {__('New Email')}
          <div>
            <Icon size={10} icon={shrink === 'true' ? 'plus' : 'minus'} />
            <Icon size={10} icon="cancel" onClick={() => onClose()} />
          </div>
        </NewEmailHeader>
        <MailForm shrink={isShrink} clear={clear} clearOnSubmit={true} />
      </WidgetWrapper>
    </>
  );
};

export default WidgetContainer;
