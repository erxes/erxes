import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { NotifButton } from '../styles';
import WidgetPopover from './WidgetPopover';
import Popover from 'react-bootstrap/Popover';

type Props = {
  callUserIntegrations: any;
  setConfig: any;
};
const Widget = (props: Props) => {
  const content = (
    <Popover id="call-popover" className="call-popover">
      <WidgetPopover autoOpenTab="Keyboard" {...props} />
    </Popover>
  );
  return (
    <OverlayTrigger
      trigger="click"
      rootClose={true}
      placement="bottom"
      overlay={content}
    >
      <NotifButton>
        <Tip text={__('Call')} placement="bottom">
          <Icon icon="phone" size={26} />
        </Tip>
      </NotifButton>
    </OverlayTrigger>
  );
};

export default Widget;
