import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { NotifButton } from '@erxes/ui-notifications/src/components/styles';
import WidgetPopover from './WidgetPopover';

class Widget extends React.Component<{}> {
  render() {
    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={<WidgetPopover autoOpenTab="Keyboard" />}
      >
        <NotifButton>
          <Icon icon="phone" size={20} />
        </NotifButton>
      </OverlayTrigger>
    );
  }
}

export default Widget;
