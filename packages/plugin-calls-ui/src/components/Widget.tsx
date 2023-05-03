import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { NotifButton } from '@erxes/ui-notifications/src/components/styles';
import { Tab, TabsContainer, TabContent } from '../styles';
import { IUserCall } from '../types';
import History from './History';
import Contact from './Contact';
import Keypad from './Keypad';

type Props = {};

type State = {
  currentTab: string;
};

class Widget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: 'Keyboard'
    };
  }

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  render() {
    const { currentTab } = this.state;

    const historyOnClick = () => {
      this.onTabClick('History');
    };

    const keyboardOnClick = () => {
      this.onTabClick('Keyboard');
    };

    const contactsOnClick = () => {
      this.onTabClick('Contact');
    };

    const popoverNotification = (
      <Popover id="call-popover" className="call-popover">
        <TabContent show={currentTab === 'History' ? true : false}>
          <History />
        </TabContent>
        <TabContent show={currentTab === 'Keyboard' ? true : false}>
          <Keypad />
        </TabContent>
        <TabContent show={currentTab === 'Contact' ? true : false}>
          <Contact />
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

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={popoverNotification}
      >
        <NotifButton>
          <Icon icon="phone" size={20} />
        </NotifButton>
      </OverlayTrigger>
    );
  }
}

export default Widget;
