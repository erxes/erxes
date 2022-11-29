import { __ } from '@erxes/ui/src/utils';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import React from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { FlexCenter, DropdownWrapper, SidebarActions } from '../styles';

const DateFilter = asyncComponent(() =>
  import('@erxes/ui/src/components/DateFilter')
);

type Props = {
  onUserSelect: (userId: string) => void;
  queryParams: any;
  history: any;
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
