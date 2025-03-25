import React, { useState } from 'react';
import { TabContent } from '../styles';

import { ICallConfigDoc } from '../types';
import KeyPadContainer from '../containers/Keypad';
import { __ } from '@erxes/ui/src/utils';
import { extractPhoneNumberFromCounterpart } from '../utils';

type Props = {
  autoOpenTab: string;
  currentCallConversationId: string;
};

const WidgetPopover = ({ currentCallConversationId }: Props) => {
  const [phoneNumber] = useState('');

  const renderContent = () => {
    return (
      <KeyPadContainer
        phoneNumber={phoneNumber}
        currentCallConversationId={currentCallConversationId}
      />
    );
  };

  return <>{/* <TabContent>{renderContent()}</TabContent> */}</>;
};

export default WidgetPopover;
