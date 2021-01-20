import { IBoardCount } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { __ } from 'modules/common/utils';
import { GROWTHHACK_STATES } from 'modules/growthHacks/constants';
import Wrapper from 'modules/layout/components/Wrapper';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Link } from 'react-router-dom';
import PipelineList from '../../containers/home/PipelineList';
import {
  BoxContainer,
  CountItem,
  FilterButton,
  FilterWrapper,
  HelperButtons
} from './styles';

type Props = {
  queryParams: any;
  boardsWithCount: IBoardCount[];
  counts: object;
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

  renderPopover() {
    return (
      <Popover id="score-popover">
        <Popover.Title as="h3">
          {__('Marketing campaigns')}
          <Link to="/settings/boards/growthHack">
            <Icon icon="cog" size={14} />
          </Link>
        </Popover.Title>
        <Popover.Content>
          <SidebarList>{this.renderBoards()}</SidebarList>
        </Popover.Content>
      </Popover>
    );
  }

  renderFilter = () => {
    const { queryParams } = this.props;
    const { state, id = '' } = queryParams;

    return (
      <FilterWrapper>
        <Tabs grayBorder={true}>
          <Link to={`/growthHack/home?id=${id}`}>
            <TabTitle className={!state ? 'active' : ''}>{__('All')}</TabTitle>
          </Link>
          <Link to={`/growthHack/home?id=${id}&state=In progress`}>
            <TabTitle className={state === 'In progress' ? 'active' : ''}>
              {__('In progress')}
            </TabTitle>
          </Link>
          <Link to={`/growthHack/home?id=${id}&state=Not started`}>
            <TabTitle className={state === 'Not started' ? 'active' : ''}>
              {__('Not started')}
            </TabTitle>
          </Link>
          <Link to={`/growthHack/home?id=${id}&state=Completed`}>
            <TabTitle className={state === 'Completed' ? 'active' : ''}>
              {__('Completed')}
            </TabTitle>
          </Link>
        </Tabs>
        <HelperButtons>
          <OverlayTrigger
            trigger="click"
            placement="bottom-end"
            rootClose={true}
            overlay={this.renderPopover()}
          >
            <FilterButton>
              {__('Filter by campaign')} <Icon icon="angle-down" />
            </FilterButton>
          </OverlayTrigger>
        </HelperButtons>
      </FilterWrapper>
    );
  };

  renderCountItem = (state: string) => {
    let iconContent = 'eabd';

    switch (state) {
      case 'In progress':
        iconContent = 'ecc5';
        break;

      case 'Not started':
        iconContent = 'eb46';
        break;

      case 'Completed':
        iconContent = 'ecd7';
        break;
    }

    return (
      <CountItem content={iconContent} key={state}>
        <h5>{state}</h5>
        <strong>{this.props.counts[state]}</strong>
      </CountItem>
    );
  };

  renderCounts = () => {
    return GROWTHHACK_STATES.map(state => this.renderCountItem(state));
  };

  renderContent = () => {
    return (
      <>
        <BoxContainer>{this.renderCounts()}</BoxContainer>
        {this.renderFilter()}
        <PipelineList queryParams={this.props.queryParams} />
      </>
    );
  };

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Growth Hacking' || ''}`}
            breadcrumb={[{ title: __('Growth Hacking') }]}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
