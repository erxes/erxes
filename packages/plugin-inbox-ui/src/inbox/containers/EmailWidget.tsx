import React, { useState } from 'react';
import MailForm from '@erxes/ui-inbox/src/settings/integrations/containers/mail/MailForm';
import { NotifButton } from '@erxes/ui-notifications/src/components/styles';
import Icon from '@erxes/ui/src/components/Icon';
import { WidgetWrapper } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import { NewEmailHeader } from '@erxes/ui-inbox/src/settings/integrations/components/mail/styles';

const WidgetContainer = () => {
  const [shrink, setShrink] = useState(false);
  const [show, setShow] = useState(true);
  const [clear, setClear] = useState(false);

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

  const onClose = () => {
    hideWidget();
    setClear(true);
  };

  const showWidget = () => {
    setShrink(false);
    setShow(!show);
    setClear(false);

    localStorage.setItem('emailWidgetShow', show ? 'true' : 'false');
  };

  const isWidgetShow = localStorage.getItem('emailWidgetShow');

  return (
    <>
      <NotifButton>
        <Tip text={__('New Email')} placement="bottom">
          <Icon icon="send" size={15} onClick={() => showWidget()} />
        </Tip>
      </NotifButton>
      <WidgetWrapper show={isWidgetShow === 'true' ? true : false}>
        <NewEmailHeader shrink={shrink} onClick={changeShrink}>
          {__('New Email')}
          <div>
            <Icon size={10} icon={shrink ? 'plus' : 'minus'} />
            <Icon size={10} icon="cancel" onClick={() => onClose()} />
          </div>
        </NewEmailHeader>
        <MailForm
          shrink={shrink}
          changeShrink={changeShrink}
          clear={clear}
          clearOnSubmit={true}
        />
      </WidgetWrapper>
    </>
  );
};

export default WidgetContainer;
