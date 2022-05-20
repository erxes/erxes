import React from 'react';

import { AppContext } from 'appContext';
import { IOrder } from 'modules/orders/types';
import { calcTaxAmount } from 'modules/utils';
import LocaleField from './LocaleField';
import { AmountContainer } from './styles';

type Props = {
  order: IOrder;
};

export default function Amount({ order }: Props) {
  const { currentConfig } = React.useContext(AppContext);
  const taxAmount = calcTaxAmount(
    order.totalAmount,
    currentConfig && currentConfig.ebarimtConfig
  );

  return (
    <AmountContainer className="block">
      <div className="order-amounts">
        <div>
          <div className="sep" />
          <LocaleField text="Дүн" data={order.totalAmount} />
          <div className="sep" />
          <LocaleField text="НӨАТ" data={taxAmount.vatAmount} />
          <LocaleField text="НХАТ" data={taxAmount.cityTaxAmount} />
        </div>
        <div className="sep" />
        {order.status === 'paid' ? <div className="sep" /> : null}
        <LocaleField text="Бэлнээр" data={order.cashAmount} />
        <LocaleField text="Картаар" data={order.cardAmount} />
        <LocaleField text="Мобайл" data={order.mobileAmount} />
      </div>
    </AmountContainer>
  );
}
