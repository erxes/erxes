import { IBoardCount } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import PipelineList from '../../containers/home/PipelineList';

const { Section } = Wrapper.Sidebar;

type Props = {
  queryParams: any;
  boardsWithCount: IBoardCount[];
};

class Home extends React.Component<Props> {
  renderBoards() {
    const { queryParams, boardsWithCount } = this.props;

    const { id = '', state = '' } = queryParams;

    if (boardsWithCount.length === 0) {
      return <EmptyState text="There is no campaign" icon="folder-2" />;
    }

    return boardsWithCount.map(board => (
      <li key={board._id}>
        <Link
          className={id === board._id ? 'active' : ''}
          to={`/growthHack/home?id=${board._id}&state=${state}`}
        >
          <FieldStyle>{board.name}</FieldStyle>
          <SidebarCounter>{board.count}</SidebarCounter>
        </Link>
      </li>
    ));
  }

  renderSidebar() {
    const { queryParams } = this.props;
    const { state, id = '' } = queryParams;

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
                to={`/growthHack/home?id=${id}`}
              >
                All
              </Link>
            </li>
            <li>
              <Link
                className={state === 'In progress' ? 'active' : ''}
                to={`/growthHack/home?id=${id}&state=In progress`}
              >
                In progress
              </Link>
            </li>
            <li>
              <Link
                className={state === 'Not started' ? 'active' : ''}
                to={`/growthHack/home?id=${id}&state=Not started`}
              >
                Not started
              </Link>
            </li>
            <li>
              <Link
                className={state === 'Completed' ? 'active' : ''}
                to={`/growthHack/home?id=${id}&state=Completed`}
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
    return <PipelineList queryParams={this.props.queryParams} />;
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
