import KitchenReceiptBody from './KitchenReceiptBody';
import React, { useContext } from 'react';
import { AppContext } from '../../../../appContext';
import { IOrder } from '../../../orders/types';

export default function KitchenReceipt({ order }: { order: IOrder }) {
  const { currentConfig } = useContext(AppContext);
  if (!order) {
    return null;
  }

  const logo =
    currentConfig &&
    currentConfig.uiOptions &&
    currentConfig.uiOptions.receiptIcon;
  const name = currentConfig && currentConfig.name ? currentConfig.name : '';

  return <KitchenReceiptBody order={order} logo={logo} name={name} />;
}
