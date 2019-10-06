import { IBoard } from 'modules/boards/types';
import LeftSidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarList } from 'modules/layout/styles';
import { SidebarListItem } from 'modules/settings/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardPipelineList from '../../containers/Dashboard/DashboardPipelineList';
import { FilterList, FilterListItem } from '../../styles';

type Props = {
  state: string;
  boards: IBoard[];
  boardId: string;
};

class DashBoard extends React.Component<Props> {
  renderBoards() {
    const { boardId, boards } = this.props;

    return boards.map(board => (
      <SidebarListItem key={board._id} isActive={boardId === board._id}>
        <Link to={`/growthHack/dashboard?id=${board._id}`}>{board.name}</Link>
      </SidebarListItem>
    ));
  }

  renderFilter() {
    const { boardId, state } = this.props;

    return (
      <FilterList>
        <FilterListItem isActive={!state}>
          <Link to={`/growthHack/dashBoard?id=${boardId}`}>All</Link>
        </FilterListItem>
        <FilterListItem isActive={state === 'In progress'}>
          <Link to={`/growthHack/dashBoard?id=${boardId}&state=In progress`}>
            In progress
          </Link>
        </FilterListItem>
        <FilterListItem isActive={state === 'Not started'}>
          <Link to={`/growthHack/dashBoard?id=${boardId}&state=Not started`}>
            Not started
          </Link>
        </FilterListItem>
        <FilterListItem isActive={state === 'Completed'}>
          <Link to={`/growthHack/dashBoard?id=${boardId}&state=Completed`}>
            Completed
          </Link>
        </FilterListItem>
      </FilterList>
    );
  }

  renderSidebarHeader() {
    const { Header } = LeftSidebar;
    return <Header uppercase={true}>{'Campaign'}</Header>;
  }

  render() {
    const breadcrumb = [{ title: 'Growth Hacking', link: '/growthHack' }];
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Campaign' || ''}`}
            breadcrumb={breadcrumb}
          />
        }
        leftSidebar={
          <LeftSidebar
            wide={true}
            full={true}
            header={this.renderSidebarHeader()}
          >
            <SidebarList>{this.renderBoards()}</SidebarList>
          </LeftSidebar>
        }
        actionBar={
          <Wrapper.ActionBar left={'PROJECTS'} right={this.renderFilter()} />
        }
        transparent={true}
        content={<DashboardPipelineList state={this.props.state} />}
      />
    );
  }
}

export default DashBoard;
