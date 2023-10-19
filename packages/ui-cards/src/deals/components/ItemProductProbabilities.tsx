import React from 'react';
import { renderAmount, renderPercentedAmount } from '../../boards/utils';
import { __ } from '@erxes/ui/src/utils/core';
import { StageInfo } from '../../boards/styles/stage';
import { IDeal } from '../types';

type Props = {
  totalAmount?: any;
  deals?: any[];
  dealTotalAmounts?: any[];
  probability?: string;
};

class ItemProductProbabilities extends React.Component<Props, {}> {
  renderForecast = (probabilityPercentage: number) => {
    const { totalAmount } = this.props;

    return (
      <div>
        <span>{__('Forecasted') + `(${probabilityPercentage})`}</span>
        {renderPercentedAmount(totalAmount, probabilityPercentage)}
      </div>
    );
  };

  renderSum(currencies) {
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

  renderPercentage = value => {
    return value === 'Won' ? '100%' : value === 'Lost' ? '0%' : value;
  };

  renderInfo = () => {
    const {
      probability,
      totalAmount,
      deals = [] as IDeal[],
      dealTotalAmounts = []
    } = this.props;

    const forecastArray: Array<{
      amount: number;
      name: string;
      probability: number;
    }> = [];
    const totalAmountArray: Array<{ amount: number; name: string }> = [];

    if (dealTotalAmounts.length > 0) {
      dealTotalAmounts.map(total =>
        total.currencies.map(currency => totalAmountArray.push(currency))
      );
    }

    deals.map(deal => {
      const percentage = deal.stage?.probability || null;

      if (percentage) {
        Object.keys(deal.amount).map(key =>
          forecastArray.push({
            name: key,
            amount: deal.amount[key] as number,
            probability: parseInt(this.renderPercentage(percentage), 10)
          })
        );
      }
    });

    if (totalAmount) {
      return (
        <StageInfo>
          {Object.keys(totalAmount).length > 0 && (
            <div>
              <span>{__('Total')}</span>
              {renderAmount(totalAmount)}
            </div>
          )}
          {probability &&
            this.renderForecast(
              parseInt(this.renderPercentage(probability), 10)
            )}
        </StageInfo>
      );
    }

    return (
      <>
        <li>
          <span>Total </span>
          {this.renderSum(totalAmountArray)}
        </li>
        {forecastArray.length > 0 && (
          <li>
            <span>Forecasted </span>
            {this.renderSum(forecastArray)}
          </li>
        )}
      </>
    );
  };

  render() {
    const { totalAmount, deals, dealTotalAmounts } = this.props;

    if (!totalAmount && !deals && !dealTotalAmounts) {
      return null;
    }

    return this.renderInfo();
  }
}

export default ItemProductProbabilities;
