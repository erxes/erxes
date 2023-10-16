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
import options from '@erxes/ui-cards/src/deals/options';
import { IDeal, IDealTotalAmount } from '@erxes/ui-cards/src/deals/types';
import Deal from '@erxes/ui-cards/src/deals/components/DealItem';
import styledTS from 'styled-components-ts';

type Props = {
  deals: IDeal[];
  totalCount: number;
  date: IDateColumn;
  dealTotalAmounts: IDealTotalAmount[];
  onLoadMore: (skip: number) => void;
};

const Amount = styledTS<{ showAll: boolean }>(styled.ul)`
  list-style: none;
  overflow: hidden;
  margin: 0 0 5px;
  padding: 0 16px;

  ${props =>
    props.showAll === false
      ? `
  height: 20px;
  overflow: hidden;
  transition: all 300ms ease-out;
  `
      : `
  height: unset;
  `}

  li {
    padding-right: 5px;
    font-size: 12px;

    > div {
      float: right;
    }

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

  div {
    display: inline;
  }
`;

class DealColumn extends React.Component<Props, {}> {
  componentDidMount() {
    window.addEventListener('storageChange', this.handleStorageChange);
  }

  componentWillUnmount() {
    window.removeEventListener('storageChange', this.handleStorageChange);
  }

  handleStorageChange = () => {
    this.forceUpdate();
  };

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
      <div key={index}>
        {total.amount.toLocaleString()}{' '}
        <span>
          {total.name}
          {index < currencies.length - 1 && ', '}
        </span>
      </div>
    ));
  }

  renderTotalAmount() {
    const { dealTotalAmounts, deals } = this.props;
    const totalForType = dealTotalAmounts || [];

    const forecastArray = [];
    const totalAmountArray = [];

    dealTotalAmounts.map(total =>
      total.currencies.map(currency => totalAmountArray.push(currency))
    );

    this.props.deals.map(deal => {
      const probability =
        deal.stage.probability === 'Won'
          ? '100%'
          : deal.stage.probability === 'Lost'
          ? '0%'
          : deal.stage.probability;

      Object.keys(deal.amount).map(key =>
        forecastArray.push({
          name: key,
          amount: deal.amount[key] as number,
          probability: parseInt(probability, 10)
        })
      );
    });

    const detail = () => {
      if (!deals || deals.length === 0) {
        return null;
      }

      return (
        <>
          <li>
            <span>Total ({deals.length}): </span>
            {this.renderPercentedAmount(totalAmountArray)}
          </li>
          <li>
            <span>Forecasted: </span>
            {this.renderPercentedAmount(forecastArray)}
          </li>
        </>
      );
    };

    return (
      <Amount
        showAll={
          localStorage.getItem('showSalesDetail') === 'true' ? true : false
        }
      >
        {detail()}
        {totalForType.map(type => {
          if (type.name === 'In progress') {
            return null;
          }

          const percent = type.name === 'Won' ? '100%' : '0%';

          return (
            <li key={type._id}>
              <span>
                {type.name} ({percent}):{' '}
              </span>
              {this.renderAmount(type.currencies)}
            </li>
          );
        })}
      </Amount>
    );
  }

  renderPercentedAmount(currencies) {
    const sumByName = {};

    currencies.forEach(item => {
      const { name, amount, probability = 100 } = item;
      if (sumByName[name] === undefined) {
        sumByName[name] = (amount * probability) / 100;
      } else {
        sumByName[name] += (amount * probability) / 100;
      }
    });

    return Object.keys(sumByName).map((key, index) => (
      <div key={index}>
        {sumByName[key].toLocaleString(undefined, {
          maximumFractionDigits: 0
        })}{' '}
        <span>
          {key}
          {index < Object.keys(sumByName).length - 1 && ','}&nbsp;
        </span>
      </div>
    ));
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
