import { SIP_STATUS_DISCONNECTED, SIP_STATUS_ERROR } from '../lib/enums';
import { callPropType, sipPropType } from '../lib/types';

import Icon from '@erxes/ui/src/components/Icon';
import Popover from '@erxes/ui/src/components/Popover';
import React from 'react';
import WidgetPopover from './WidgetPopover';
import { WidgetWrapper } from '../styles';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  callUserIntegrations: any;
  setConfig: any;
  callDirection?: string;
  setHideIncomingCall?: (isHide: boolean) => void;
  hideIncomingCall?: boolean;
};

const Widget = (props: Props, context) => {
  const Sip = context;
  const { callDirection } = props;
  const isConnected =
    !Sip.call ||
    Sip.sip?.status === SIP_STATUS_ERROR ||
    Sip.sip?.status === SIP_STATUS_DISCONNECTED;

  const onClick = () => {
    const { setHideIncomingCall, hideIncomingCall } = props;
    if (setHideIncomingCall) {
      setHideIncomingCall(!hideIncomingCall);
    }
  };
  return (
    <Popover
      trigger={
        <WidgetWrapper $isConnected={isConnected} onClick={onClick}>
          <Icon icon={isConnected ? 'phone-slash' : 'phone'} size={23} />
        </WidgetWrapper>
      }
      placement="top"
      className="call-popover"
    >
      <WidgetPopover autoOpenTab="Keyboard" {...props} />
    </Popover>
  );
};

Widget.contextTypes = {
  sip: sipPropType,
  call: callPropType,
};

export default Widget;
