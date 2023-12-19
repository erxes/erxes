import React, { useState } from 'react';
import Popover from 'react-bootstrap/Popover';
import { Tab, TabsContainer, TabContent } from '../styles';
import History from './History';
import { Icon } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import KeyPadContainer from '../containers/KeyPad';
import ContactsContainer from '../containers/Contacts';

type Props = {
  autoOpenTab: string;
  callIntegrationsOfUser?: any;
  setConfig?: any;
};

const WidgetPopover = ({
  autoOpenTab,
  callIntegrationsOfUser,
  setConfig
}: Props) => {
  const [currentTab, setCurrentTab] = useState(autoOpenTab || 'Keyboard');
  const onTabClick = newTab => {
    setCurrentTab(newTab);
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
    <Popover id="call-popover" className="call-popover">
      <TabContent show={currentTab === 'History'}>
        <History />
      </TabContent>
      <TabContent show={currentTab === 'Keyboard'}>
        <KeyPadContainer
          callIntegrationsOfUser={callIntegrationsOfUser}
          setConfig={setConfig}
        />
      </TabContent>
      <TabContent show={currentTab === 'Contact'}>
        <ContactsContainer />
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
    </Popover>
  );
};

export default WidgetPopover;
