import React, { useContext } from 'react';
import { IOrder } from '../../types';
import { ReceiptWrapper } from './styles';
import { AppContext } from '../../../../appContext';
import Header from './Header';
import Body from './Body';
import InnerFooter from './InnerFooter';

type Props = {
  order: IOrder;
};

export default function OrderReceipt({ order }: Props) {
  const { currentConfig } = useContext(AppContext);

  if (!order) {
    return null;
  }

  const logo =
    currentConfig &&
    currentConfig.uiOptions &&
    currentConfig.uiOptions.receiptIcon;
  const name = currentConfig && currentConfig.name ? currentConfig.name : '';
  const color =
    currentConfig &&
    currentConfig.uiOptions &&
    currentConfig.uiOptions.colors.primary;

  return (
    <>
      <ReceiptWrapper className="printDocument">
        <Header order={order} logo={logo} name={name} />
        <Body items={order.items} />
        <InnerFooter color={color} order={order} />
      </ReceiptWrapper>
    </>
  );
}
