import Board from 'modules/boards/containers/Board';
import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';
import options from '../options';
import GrowthHackMainActionBar from './GrowthHackMainActionBar';

type Props = {
  queryParams: any;
};
class GrowthHackBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} options={options} />;
  }

  renderActionBar() {
    return (
      <MainActionBar type="growthHack" component={GrowthHackMainActionBar} />
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Growth hacking'), link: '/growthHack/board' },
      { title: __('Board') }
    ];

    return (
      <BoardContainer>
        <Header title={__('Growth hacking')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default GrowthHackBoard;
