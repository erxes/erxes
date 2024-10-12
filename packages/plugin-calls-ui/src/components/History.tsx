import {
  AdditionalDetail,
  CallDetail,
  CallHistory,
  InputBar,
  PhoneNumber,
} from '../styles';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { __, renderFullName } from '@erxes/ui/src/utils';

import Dropdown from '@erxes/ui/src/components/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IHistory } from '../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import dayjs from 'dayjs';

type Props = {
  histories: IHistory[];
  loading?: boolean;
  searchValue: string;
  navigate: any;
  totalCount: number;
  onLoadMore: () => void;
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
  onSearch: (searchValue: string) => void;
  refetch: ({ callStatus }: { callStatus: string }) => void;
  remove: (_id: string) => void;
};

type State = {
  currentTab: string;
  cursor: number;
};

class History extends React.Component<Props, State> {
  private activeItemRef: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      currentTab: 'All',
      cursor: 0,
    };

    this.activeItemRef = React.createRef();
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    if (this.activeItemRef.current) {
      this.activeItemRef.current.addEventListener('scroll', this.handleScroll);
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    if (this.activeItemRef.current) {
      this.activeItemRef.current.removeEventListener(
        'scroll',
        this.handleScroll,
      );
    }
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleScroll = () => {
    const element = this.activeItemRef.current;

    if (
      element &&
      element.scrollHeight - element.scrollTop === element.clientHeight
    ) {
      this.props.onLoadMore();
    }
  };

  handleKeyDown = (e) => {
    const { cursor } = this.state;

    if (e.keyCode === 38 && cursor > 0) {
      this.setState((prevState) => ({
        cursor: prevState.cursor - 1,
      }));
    } else if (e.keyCode === 40 && cursor < this.props.histories.length - 1) {
      this.setState((prevState) => ({
        cursor: prevState.cursor + 1,
      }));
    } else if (e.keyCode === 13) {
      this.onCall(this.props.histories[cursor].customer?.primaryPhone);
    }
  };

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });

    if (currentTab === 'Missed Call') {
      this.props.refetch({ callStatus: 'cancelled' });
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

  onSearchChange = (e) => {
    const inputValue = e.target.value;

    this.props.onSearch(inputValue);
  };

  renderCalls = () => {
    const { histories, loading, navigate } = this.props;

    if (loading) {
      return <Spinner objective={true} />;
    }

    if (!histories || histories.length === 0) {
      return <EmptyState icon="ban" text={__("There is no history")} size="small" />;
    }

    return (
      <>
        {histories.map((item, i) => {
          const { callStatus, callType, createdAt } = item;
          const isMissedCall =
            callStatus === 'missed' || callStatus === 'cancelled';

          const content = item.customer && (
            <CallDetail
              $isMissedCall={isMissedCall}
              key={i}
              className={this.state.cursor === i ? 'active' : ''}
              $isIncoming={callType !== 'outgoing' ? true : false}
              onClick={() => this.onCall(item.customer.primaryPhone)}
            >
              <div>
                {callType === 'outgoing' && (
                  <Icon size={12} icon={'outgoing-call'} />
                )}
                <PhoneNumber $shrink={true}>
                  {renderFullName(item.customer, false)}
                </PhoneNumber>
              </div>
              <AdditionalDetail>
                <span>{dayjs(createdAt).format('DD MMM, HH:mm')}</span>
                <Dropdown
                  as={DropdownToggle}
                  toggleComponent={<Icon icon="ellipsis-v" size={18} />}
                >
                  <li key="delete">
                    <a href="#" onClick={() => this.onRemove(item._id)}>
                      <Icon icon="trash-alt" size={14} /> {__('Delete')}
                    </a>
                  </li>
                  <li key="detail">
                    <a
                      href="#"
                      onClick={() =>
                        navigate(`/inbox/index?_id=${item.conversationId}`, {
                          replace: true,
                        })
                      }
                    >
                      <Icon icon="arrow-from-right" size={12} />{' '}
                      {__('Go to Detail')}
                    </a>
                  </li>
                </Dropdown>
              </AdditionalDetail>
            </CallDetail>
          );

          return content;
        })}
        {loading && <div>Loading...</div>}
      </>
    );
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
            {__('All')}{' '}
            {this.props.totalCount !== 0 && `(${this.props.totalCount})`}
          </TabTitle>
          <TabTitle
            className={currentTab === 'Missed Call' ? 'active' : ''}
            onClick={() => this.onTabClick('Missed Call')}
          >
            {__('Missed Call')}
          </TabTitle>
        </Tabs>
        <CallHistory ref={this.activeItemRef}>
          <InputBar type="searchBar">
            <FormControl
              placeholder={__('Search')}
              name="searchValue"
              onChange={this.onSearchChange}
              value={this.props.searchValue}
              autoFocus={true}
            />
            <Icon icon="search-1" size={20} />
          </InputBar>
          {this.renderCalls()}
        </CallHistory>
      </>
    );
  }
}

export default History;
