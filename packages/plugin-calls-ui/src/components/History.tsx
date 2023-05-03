import Icon from '@erxes/ui/src/components/Icon';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { CallHistory, CallDetail, AdditionalDetail } from '../styles';
import { all } from '../constants';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';

type Props = {};

type State = {
  currentTab: string;
};

class History extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: 'All'
    };
  }

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  render() {
    const { currentTab } = this.state;

    const allOnClick = () => {
      this.onTabClick('All');
    };

    const missedOnClick = () => {
      this.onTabClick('Missed Call');
    };

    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'All' ? 'active' : ''}
            onClick={allOnClick}
          >
            {__('All')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Missed Call' ? 'active' : ''}
            onClick={missedOnClick}
          >
            {__('Missed Call')}
          </TabTitle>
        </Tabs>
        <CallHistory>
          <h4>{__('Recents')}</h4>
          {all.map((item, i) => {
            const content = (
              <CallDetail isMissedCall={item.isMissedCall} key={i}>
                <NameCard
                  user={item}
                  key={i}
                  avatarSize={40}
                  secondLine="To call integration"
                />
                <AdditionalDetail>
                  {item.time}
                  <Dropdown>
                    <Dropdown.Toggle
                      as={DropdownToggle}
                      id="dropdown-convert-to"
                    >
                      <Icon icon="ellipsis-v" size={18} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <li key="call">
                        <Icon icon="outgoing-call" /> {__('Call')}
                      </li>
                      <li key="delete">
                        <Icon icon="trash-alt" size={14} /> {__('Delete')}
                      </li>
                    </Dropdown.Menu>
                  </Dropdown>
                </AdditionalDetail>
              </CallDetail>
            );

            if (currentTab === 'Missed Call') {
              if (item.isMissedCall === true) {
                return content;
              }
              return null;
            }

            return content;
          })}
        </CallHistory>
      </>
    );
  }
}

export default History;
