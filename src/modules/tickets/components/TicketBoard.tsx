import { Board, MainActionBar } from 'modules/boards/containers';
import { __ } from 'modules/common/utils';
import {
  BoardContainer,
  BoardContent,
  ScrolledContent
} from 'modules/deals/styles/common';
import { Header } from 'modules/layout/components';
import * as React from 'react';

type Props = {
  queryParams: any;
};

class TicketBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams } = this.props;

    return <Board queryParams={queryParams} type="ticket" />;
  }

  renderActionBar() {
    return <MainActionBar type="ticket" />;
  }

  render() {
    const title = __('Ticket');

    return (
      <BoardContainer>
        <Header title={title} breadcrumb={[{ title }]} />
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
