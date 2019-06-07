import { Board, MainActionBar } from 'modules/boards/containers';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/deals/styles/common';
import { Header } from 'modules/layout/components';
import * as React from 'react';
import { options } from '../constants';

type Props = {
  queryParams: any;
};
class TicketBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} options={options} />;
  }

  renderActionBar() {
    return <MainActionBar type="ticket" />;
  }

  render() {
    return (
      <BoardContainer>
        <Header title={__('Ticket')} submenu={menuInbox} />
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

export default TicketBoard;
