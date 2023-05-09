import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Popover from 'react-bootstrap/Popover';
import { Tab, TabsContainer, TabContent } from '../styles';
import History from './History';
import Contact from './Contact';
import Keypad from './Keypad';

type Props = {
  autoOpenTab: string;
};

type State = {
  currentTab: string;
};

class WidgetPopover extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: this.props.autoOpenTab || 'Keyboard'
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

    return (
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
  }
}

export default WidgetPopover;
