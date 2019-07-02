import { Board, MainActionBar } from 'modules/boards/containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import React from 'react';
import { DealMainActionBar } from '../components';
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
    return <MainActionBar type="deal" component={DealMainActionBar} />;
  }

  render() {
    return (
      <BoardContainer>
        <Header title={__('Deal')} submenu={menuDeal} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          <ScrolledContent transparent={true}>
            {this.renderContent()}
          </ScrolledContent>
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default DealBoard;
