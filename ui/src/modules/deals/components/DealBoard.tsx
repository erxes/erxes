import Board from 'modules/boards/containers/Board';
import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import Header from 'modules/layout/components/Header';
import React from 'react';
import DealMainActionBar from '../components/DealMainActionBar';
import options from '../options';

type Props = {
  queryParams: any;
};

class DealBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} options={options} />;
  }

  renderActionBar() {
    return <MainActionBar type='deal' component={DealMainActionBar} />;
  }

  render() {
    return (
      <BoardContainer>
        <Header title={__('Sales')} submenu={menuDeal} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default DealBoard;
