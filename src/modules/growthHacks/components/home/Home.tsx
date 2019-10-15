import { IBoard } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import PipelineList from '../../containers/home/PipelineList';
import { LeftActionBar } from '../../styles';

const { Section } = Wrapper.Sidebar;

type Props = {
  state: string;
  boards: IBoard[];
  boardId: string;
};

class Home extends React.Component<Props> {
  renderBoards() {
    const { boardId, boards } = this.props;

    return boards.map(board => (
      <li key={board._id}>
        <Link
          className={boardId === board._id ? 'active' : ''}
          to={`/growthHack/home?id=${board._id}`}
        >
          {board.name}
          <SidebarCounter>
            {board.pipelines && board.pipelines.length}
          </SidebarCounter>
        </Link>
      </li>
    ));
  }

  renderSidebar() {
    const { boardId, state } = this.props;

    return (
      <>
        <Section>
          <Section.Title>{__('Marketing campaign')}</Section.Title>
          <Section.QuickButtons>
            <Link to="/settings/boards/growthHack">
              <Icon icon="settings" />
            </Link>
          </Section.QuickButtons>
          <SidebarList>{this.renderBoards()}</SidebarList>
        </Section>

        <Section>
          <Section.Title>{__('Filter by status')}</Section.Title>
          <SidebarList>
            <li>
              <Link
                className={!state ? 'active' : ''}
                to={`/growthHack/home?id=${boardId}`}
              >
                All
              </Link>
            </li>
            <li>
              <Link
                className={state === 'In progress' ? 'active' : ''}
                to={`/growthHack/home?id=${boardId}&state=In progress`}
              >
                In progress
              </Link>
            </li>
            <li>
              <Link
                className={state === 'Not started' ? 'active' : ''}
                to={`/growthHack/home?id=${boardId}&state=Not started`}
              >
                Not started
              </Link>
            </li>
            <li>
              <Link
                className={state === 'Completed' ? 'active' : ''}
                to={`/growthHack/home?id=${boardId}&state=Completed`}
              >
                Completed
              </Link>
            </li>
          </SidebarList>
        </Section>
      </>
    );
  }

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Growth Hacking' || ''}`}
            breadcrumb={[{ title: __('Growth Hacking') }]}
          />
        }
        leftSidebar={<Wrapper.Sidebar>{this.renderSidebar()}</Wrapper.Sidebar>}
        actionBar={
          <Wrapper.ActionBar left={<LeftActionBar>Projects</LeftActionBar>} />
        }
        transparent={true}
        content={<PipelineList state={this.props.state} />}
      />
    );
  }
}

export default Home;
