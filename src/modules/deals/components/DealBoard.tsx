import { __ } from 'modules/common/utils';
import { menuDeal } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import { Board, MainActionBar } from '../containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from '../styles/common';

type Props = {
  queryParams: any;
};

class DealBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} />;
  }

  renderActionBar() {
    return <MainActionBar />;
  }

  render() {
    return (
      <BoardContainer>
        <Header submenu={menuDeal} />
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
