import Icon from '@erxes/ui/src/components/Icon';
import Popover from '@erxes/ui/src/components/Popover';
import React from 'react';
import WidgetPopover from './WidgetPopover';
import { WidgetWrapper } from '../styles';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  callUserIntegrations: any;
  setConfig: any;
  setHideIncomingCall?: (isHide: boolean) => void;
  hideIncomingCall?: boolean;
  currentCallConversationId: string;
};

const Widget = (props: Props) => {
  const isConnected = JSON.parse(
    localStorage.getItem('config:cloudflareCall') || '{}',
  ).isAvailable;
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
          <Icon icon={isConnected ? 'phone' : 'phone-slash'} size={23} />
        </WidgetWrapper>
      }
      placement="top"
      className="cloudflarecall-popover"
      defaultOpen={true}
    >
      <WidgetPopover autoOpenTab="Keyboard" {...props} />
    </Popover>
  );
};

export default Widget;
