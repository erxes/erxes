import Icon from '@erxes/ui/src/components/Icon';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import React from 'react';
import WidgetPopover from './WidgetPopover';
import { WidgetWrapper } from '../styles';
import { __ } from '@erxes/ui/src/utils';

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
      <WidgetWrapper>
        <Icon icon="phone" size={23} />
      </WidgetWrapper>
    </OverlayTrigger>
  );
};

export default Widget;
