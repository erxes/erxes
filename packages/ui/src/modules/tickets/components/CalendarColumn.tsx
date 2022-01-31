import {
  ColumnContainer,
  ColumnContentBody,
  ColumnFooter
} from 'modules/boards/components/Calendar';
import { AddNew } from 'modules/boards/styles/stage';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import { IDateColumn } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import options from '../options';
import { ITicket } from '../types';
import Ticket from './TicketItem';

type Props = {
  tickets: ITicket[];
  totalCount: number;
  date: IDateColumn;
  onLoadMore: (skip: number) => void;
};

class TicketColumn extends React.Component<Props, {}> {
  onLoadMore = () => {
    const { tickets, onLoadMore } = this.props;
    onLoadMore(tickets.length);
  };

  renderContent() {
    const { tickets } = this.props;

    if (tickets.length === 0) {
      return <EmptyState icon="postcard" text="No tickets" />;
    }

    const contents = tickets.map((ticket: ITicket, index: number) => (
      <Ticket options={options} key={index} item={ticket} portable={true} />
    ));

    return <ColumnContentBody>{contents}</ColumnContentBody>;
  }

  renderFooter() {
    const { tickets, totalCount } = this.props;

    if (tickets.length === totalCount || tickets.length > totalCount) {
      return null;
    }

    return (
      <ColumnFooter>
        <AddNew onClick={this.onLoadMore}>
          <Icon icon="refresh" /> {__('Load more')}
        </AddNew>
      </ColumnFooter>
    );
  }

  render() {
    return (
      <ColumnContainer>
        {this.renderContent()}
        {this.renderFooter()}
      </ColumnContainer>
    );
  }
}

export default TicketColumn;
