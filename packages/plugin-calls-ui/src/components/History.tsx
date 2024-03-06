import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { CallHistory, CallDetail, AdditionalDetail } from '../styles';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { EmptyState } from '@erxes/ui/src/components';
import { IHistory } from '../types';

type Props = {
  histories: IHistory[];
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
  refetch: ({ callStatus: string }) => void;
  remove: (_id: string) => void;
};

type State = {
  currentTab: string;
};

class History extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: 'All',
    };
  }

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
    if (currentTab === 'Missed Call') {
      this.props.refetch({ callStatus: 'missed' });
    } else {
      this.props.refetch({ callStatus: 'all' });
    }
  };

  onCall = (phoneNumber) => {
    this.props.changeMainTab(phoneNumber, 'Keyboard');
  };

  onRemove = (_id) => {
    this.props.remove(_id);
  };

  renderCalls = () => {
    if (!this.props.histories || this.props.histories.length === 0) {
      return <EmptyState icon="ban" text="There is no history" size="small" />;
    }

    return this.props.histories.map((item, i) => {
      const secondLine =
        item.customer !== null ? item.customer.primaryPhone : 'unknown user';
      const content = (
        <CallDetail isMissedCall={false} key={i}>
          <NameCard
            user={item.customer}
            key={i}
            avatarSize={40}
            secondLine={secondLine}
          />
          <AdditionalDetail>
            <Dropdown>
              <Dropdown.Toggle as={DropdownToggle} id="dropdown-convert-to">
                <Icon icon="ellipsis-v" size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <li
                  key="call"
                  onClick={() => this.onCall(item.customer?.primaryPhone)}
                >
                  <Icon icon="outgoing-call" /> {__('Call')}
                </li>
                <li key="delete" onClick={() => this.onRemove(item._id)}>
                  <Icon icon="trash-alt" size={14} /> {__('Delete')}
                </li>
              </Dropdown.Menu>
            </Dropdown>
          </AdditionalDetail>
        </CallDetail>
      );

      return content;
    });
  };

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'All' ? 'active' : ''}
            onClick={() => this.onTabClick('All')}
          >
            {__('All')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Missed Call' ? 'active' : ''}
            onClick={() => this.onTabClick('Missed Call')}
          >
            {__('Missed Call')}
          </TabTitle>
        </Tabs>
        <CallHistory>
          <h4>{__('Recents')}</h4>
          {this.renderCalls()}
        </CallHistory>
      </>
    );
  }
}

export default History;
