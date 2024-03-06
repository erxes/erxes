import React, { useState } from 'react';
import { Tab, TabsContainer, TabContent } from '../styles';
import { Icon } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import KeyPadContainer from '../containers/KeyPad';
import ContactsContainer from '../containers/Contacts';
import HistoryContainer from '../containers/History';

type Props = {
  autoOpenTab: string;
  callIntegrationsOfUser?: any;
  setConfig?: any;
};

const WidgetPopover = ({
  autoOpenTab,
  callIntegrationsOfUser,
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
          callIntegrationsOfUser={callIntegrationsOfUser}
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
          <Icon icon="book" size={20} />
          {__('Contact')}
        </Tab>
      </TabsContainer>
    </>
  );
};

export default WidgetPopover;
