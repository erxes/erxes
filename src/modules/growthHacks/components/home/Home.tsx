import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { SidebarCounter, SidebarList } from 'modules/layout/styles';
import { BoxContainer } from 'modules/settings/growthHacks/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import PipelineList from '../../containers/home/PipelineList';

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

  renderContent = () => {
    return (
      <BoxContainer>
        <PipelineList state={this.props.state} />
      </BoxContainer>
    );
  };

  render() {
    const actionBarRight = (
      <Link to="/settings/boards/growthHack">
        <Button btnStyle="success" size="small" icon="diagram">
          {__('Campaign & Project')}
        </Button>
      </Link>
    );

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
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/31.svg"
                title="Projects"
                description={`From ideas to actual performance, making sure everything recorded, prioritized and centralized in the single platform to get tested with pool of analysis and learnings, which made the growing as pleasure.`}
              />
            }
            right={actionBarRight}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
