import { Board, MainActionBar } from 'modules/boards/containers';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import { menuInbox } from 'modules/common/utils/menus';
import { Header } from 'modules/layout/components';
import React from 'react';
import options from '../options';
import { TicketMainActionBar } from './';

type Props = {
  queryParams: any;
};
class TicketBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} options={options} />;
  }

  renderActionBar() {
    return <MainActionBar type="ticket" component={TicketMainActionBar} />;
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
