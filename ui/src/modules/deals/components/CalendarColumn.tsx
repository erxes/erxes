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
import styled from 'styled-components';
import options from '../options';
import { IDeal, IDealTotalAmount } from '../types';
import Deal from './DealItem';

type Props = {
  deals: IDeal[];
  totalCount: number;
  date: IDateColumn;
  dealTotalAmounts: IDealTotalAmount[];
  onLoadMore: (skip: number) => void;
};

const Amount = styled.ul`
  list-style: none;
  overflow: hidden;
  margin: 0 0 5px;
  padding: 0 16px;

  li {
    padding-right: 5px;
    font-size: 12px;

    span {
      font-weight: bold;
      font-size: 10px;
    }

    &:after {
      margin-left: 5px;
    }

    &:last-child:after {
      content: '';
    }
  }
`;

class DealColumn extends React.Component<Props, {}> {
  onLoadMore = () => {
    const { deals, onLoadMore } = this.props;
    onLoadMore(deals.length);
  };

  renderContent() {
    const { deals } = this.props;

    if (deals.length === 0) {
      return <EmptyState icon="piggy-bank" text="No Sales Pipelines" />;
    }

    const contents = deals.map((deal: IDeal, index: number) => (
      <Deal options={options} key={index} item={deal} portable={true} />
    ));

    return <ColumnContentBody>{contents}</ColumnContentBody>;
  }

  renderAmount(currencies: [{ name: string; amount: number }]) {
    return currencies.map((total, index) => (
      <div key={index} style={{ display: 'inline' }}>
        {total.amount.toLocaleString()}{' '}
        <span>
          {total.name}
          {index < currencies.length - 1 && ', '}
        </span>
      </div>
    ));
  }

  renderTotalAmount() {
    const { dealTotalAmounts } = this.props;
    const totalForType = dealTotalAmounts || [];

    return (
      <Amount>
        {totalForType.map(type => (
          <li key={type._id}>
            <span>{type.name}: </span>
            {this.renderAmount(type.currencies)}
          </li>
        ))}
      </Amount>
    );
  }

  renderFooter() {
    const { deals, totalCount } = this.props;

    if (deals.length === totalCount || deals.length > totalCount) {
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
        {this.renderTotalAmount()}
        {this.renderContent()}
        {this.renderFooter()}
      </ColumnContainer>
    );
  }
}

export default DealColumn;
