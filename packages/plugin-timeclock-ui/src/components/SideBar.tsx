import { __ } from '@erxes/ui/src/utils/core';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import Button from '@erxes/ui/src/components/Button';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import { ControlLabel } from '@erxes/ui/src/components';

const DropdownWrapper = styled.div`
  position: relative;
  > div {
    padding-left: 20px;
  }
`;

const SelectMemberStyled = styledTS<{ zIndex?: number }>(styled.div)`
  position: relative;
  z-index: ${props => (props.zIndex ? props.zIndex : '2001')};
`;

const FlexCenter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SidebarActions = styled.div`
  #date-popover {
    max-width: 470px;
    width: 500px;
  }

  .rdtPicker {
    width: 100%;
  }
`;

const DateFilter = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Inbox-DateFilter" */ '@erxes/ui/src/components/DateFilter'
    ),
  { height: '15px', width: '70px' }
);

type Props = {
  closeModal?: () => void;
  afterSave?: () => void;
  queryParams: any;
  history: any;
  currentDate?: string;
};

type State = {
  today: string;
  thisWeek: string[];
};

const addDaysOfWeek = (today: Date): string[] => {
  let diffFromMon = today.getDay() - 1;
  const diffFromSun = 7 - today.getDay();
  const currWeek: string[] = [];

  while (diffFromMon !== 0) {
    currWeek.push(
      dayjs(today)
        .add(-diffFromMon, 'day')
        .toDate()
        .toDateString()
    );
    diffFromMon -= 1;
  }
  currWeek.push(today.toDateString());
  for (let i = 1; i <= diffFromSun; i++) {
    currWeek.push(
      dayjs(today)
        .add(i, 'day')
        .toDate()
        .toDateString()
    );
  }

  return currWeek;
};

console.log(addDaysOfWeek(new Date()));

class LeftSideBar extends React.Component<Props, State> {
  trigger = (
    <Button
      id={'AddTypeButton'}
      btnStyle="success"
      icon="plus-circle"
      block={true}
    >
      Create Category
    </Button>
  );

  editTrigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')}>
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  constructor(props: Props) {
    super(props);
    // const { currentDate } = this.props;
  }

  onUserSelect = user => {
    console.log(user);
  };
  renderSidebarActions() {
    const { queryParams, history } = this.props;
    return (
      <Sidebar.Header>
        <FlexCenter>
          <DropdownWrapper>
            <DateFilter
              queryParams={queryParams}
              history={history}
              // countQueryParam="conversationsTotalCount"
            />
          </DropdownWrapper>
          <SelectTeamMembers
            label="Team member"
            name="selectedMemberIds"
            onSelect={this.onUserSelect}
          />
        </FlexCenter>
      </Sidebar.Header>
    );
  }

  renderSidebarHeader() {
    return <SidebarActions>{this.renderSidebarActions()}</SidebarActions>;
  }

  ListItem = (date, currentDate) => {
    const className = currentDate && date === currentDate ? 'active' : '';
    return (
      <SidebarListItem isActive={className === 'active'} key={date}>
        <Link to={`/timeclocks?day=${date}`}>{__(date)}</Link>
      </SidebarListItem>
    );
  };

  render() {
    this.state = {
      today: dayjs()
        .toDate()
        .toDateString(),
      thisWeek: addDaysOfWeek(new Date())
    };

    return (
      <Sidebar wide={true} full={true} header={this.renderSidebarHeader()}>
        <div>asdasd</div>
      </Sidebar>
    );
  }
}

export default LeftSideBar;
