import { router, __ } from '@erxes/ui/src/utils';
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

const DropdownWrapper = styled.div`
  position: relative;
  > div {
    padding-left: 20px;
  }
`;

const FlexCenter = styled.div`
  display: flex;
  justify-content: center;
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
  onUserSelect: (userId: string) => void;
  closeModal?: () => void;
  afterSave?: () => void;
  queryParams: any;
  history: any;
  currentDate?: string;
};

class LeftSideBar extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  onUserSelect = userId => {
    this.props.onUserSelect(userId);
  };
  renderSidebarActions() {
    const { queryParams, history } = this.props;
    return (
      <Sidebar.Header>
        <FlexCenter>
          <DropdownWrapper>
            <DateFilter queryParams={queryParams} history={history} />
          </DropdownWrapper>
        </FlexCenter>
      </Sidebar.Header>
    );
  }

  renderSidebarHeader() {
    return <SidebarActions>{this.renderSidebarActions()}</SidebarActions>;
  }

  render() {
    const { queryParams, history } = this.props;
    return (
      <Sidebar wide={true} full={true} header={this.renderSidebarHeader()}>
        <SelectTeamMembers
          queryParams={queryParams}
          label="Team member"
          name="userId"
          onSelect={this.onUserSelect}
          multi={false}
        />
      </Sidebar>
    );
  }
}

export default LeftSideBar;
