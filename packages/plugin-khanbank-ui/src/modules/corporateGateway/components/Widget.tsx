import Icon from '@erxes/ui/src/components/Icon';
import React, { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { WidgetButton } from '../../../styles';
import RateList from '../containers/Rates';

const Widget = () => {
  const popoverRates = (
    <Popover id="chat-popover" className="notification-popover">
      <RateList />
    </Popover>
  );

  return (
    <>
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={popoverRates}
      >
        <WidgetButton>
          <Icon icon="dollar-sign" size={20} />
        </WidgetButton>
      </OverlayTrigger>
    </>
  );
};

export default Widget;
