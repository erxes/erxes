import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
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
          <Tip text={__('Call')} placement="bottom">
            <Icon icon="phone" size={20} />
          </Tip>
        </NotifButton>
      </OverlayTrigger>
    );
  }
}

export default Widget;
