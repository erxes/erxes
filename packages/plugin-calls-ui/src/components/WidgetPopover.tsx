import React, { useState } from 'react';
import { Tab, TabContent, TabsContainer } from '../styles';

import ContactsContainer from '../containers/Contacts';
import HistoryContainer from '../containers/History';
import { Icon } from '@erxes/ui/src/components';
import KeyPadContainer from '../containers/KeyPad';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  autoOpenTab: string;
  callUserIntegrations?: any;
  setConfig?: any;
};

const WidgetPopover = ({
  autoOpenTab,
  callUserIntegrations,
  setConfig,
}: Props) => {
  const [currentTab, setCurrentTab] = useState(autoOpenTab || 'Keyboard');
  const [phoneNumber, setPhoneNumber] = useState('');

  const onTabClick = (newTab) => {
    setCurrentTab(newTab);
  };

  const changeTab = (number, tab) => {
    setCurrentTab(tab);
    setPhoneNumber(number);
  };

  const historyOnClick = () => {
    onTabClick('History');
  };

  const keyboardOnClick = () => {
    onTabClick('Keyboard');
  };

  const contactsOnClick = () => {
    onTabClick('Contact');
  };
  return (
    <>
      <TabContent show={currentTab === 'History'}>
        <HistoryContainer changeMainTab={changeTab} />
      </TabContent>
      <TabContent show={currentTab === 'Keyboard'}>
        <KeyPadContainer
          callUserIntegrations={callUserIntegrations}
          setConfig={setConfig}
          phoneNumber={phoneNumber}
        />
      </TabContent>
      <TabContent show={currentTab === 'Contact'}>
        <ContactsContainer changeMainTab={changeTab} />
      </TabContent>
      <TabsContainer full={true}>
        <Tab
          className={currentTab === 'History' ? 'active' : ''}
          onClick={historyOnClick}
        >
          <Icon icon="history" size={20} />
          {__('History')}
        </Tab>
        <Tab
          className={currentTab === 'Keyboard' ? 'active' : ''}
          onClick={keyboardOnClick}
        >
          <Icon icon="keyboard-alt" size={20} />
          {__('Keyboard')}
        </Tab>
        <Tab
          className={currentTab === 'Contact' ? 'active' : ''}
          onClick={contactsOnClick}
        >
          <Icon icon="book" size={18} />
          {__('Contact')}
        </Tab>
      </TabsContainer>
    </>
  );
};

export default WidgetPopover;
