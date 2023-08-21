//purchase
import {
  ColumnContainer,
  ColumnContentBody,
  ColumnFooter
} from '@erxes/ui-cards/src/boards/components/Calendar';
import { AddNew } from '@erxes/ui-cards/src/boards/styles/stage';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import { IDateColumn } from '@erxes/ui/src/types';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';
import styled from 'styled-components';
import options from '@erxes/ui-cards/src/purchases/options';
import {
  IPurchase,
  IPurchaseTotalAmount
} from '@erxes/ui-cards/src/purchases/types';
import Purchase from '@erxes/ui-cards/src/purchases/components/PurchaseItem';

type Props = {
  purchases: IPurchase[];
  totalCount: number;
  date: IDateColumn;
  purchaseTotalAmounts: IPurchaseTotalAmount[];
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

class PurchaseColumn extends React.Component<Props, {}> {
  onLoadMore = () => {
    const { purchases, onLoadMore } = this.props;
    onLoadMore(purchases.length);
  };

  renderContent() {
    const { purchases } = this.props;

    if (purchases.length === 0) {
      return <EmptyState icon="piggy-bank" text="No Purchases Pipelines" />;
    }

    const contents = purchases.map((purchase: IPurchase, index: number) => (
      <Purchase options={options} key={index} item={purchase} portable={true} />
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
    const { purchaseTotalAmounts } = this.props;
    const totalForType = purchaseTotalAmounts || [];

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
    const { purchases, totalCount } = this.props;

    if (purchases.length === totalCount || purchases.length > totalCount) {
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

export default PurchaseColumn;
