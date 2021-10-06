import Board from 'modules/boards/containers/Board';
import MainActionBar from 'modules/boards/containers/MainActionBar';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { __ } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';
import options from '../options';
import TicketMainActionBar from './TicketMainActionBar';

type Props = {
  queryParams: any;
  viewType: string;
};
class TicketBoard extends React.Component<Props> {
  renderContent() {
    const { queryParams, viewType } = this.props;

    return (
      <Board viewType={viewType} queryParams={queryParams} options={options} />
    );
  }

  renderActionBar() {
    return <MainActionBar type="ticket" component={TicketMainActionBar} />;
  }

  render() {
    const breadcrumb = [{ title: __('Ticket') }];

    return (
      <BoardContainer>
        <Header title={__('Ticket')} breadcrumb={breadcrumb} />
        <BoardContent transparent={true}>
          {this.renderActionBar()}
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default TicketBoard;
