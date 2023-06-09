import { ActionButtons, Button, Icon, Tip } from '@erxes/ui/src/components';
import { FormControl } from '@erxes/ui/src/components/form';
import Label from '@erxes/ui/src/components/Label';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import React from 'react';

import { renderFullName } from '@erxes/ui/src/utils';
import { __, renderUserFullName } from '@erxes/ui/src/utils/core';
import { IInvoice } from '../../types';
import { PAYMENTCONFIGS } from '../constants';

type Props = {
  invoice: IInvoice;
  history: any;
  isChecked: boolean;
  onClick: (invoiceId: string) => void;
  toggleBulk: (invoice: IInvoice, isChecked?: boolean) => void;
  check: (invoiceId: string) => void;
};

class Row extends React.Component<Props> {
  renderCheckAction = () => {
    const onClick = () => this.props.check(this.props.invoice._id);

    return (
      <Tip text={__('Check invoice')} placement="top">
        <Button
          id="checkInvoice"
          btnStyle="link"
          onClick={onClick}
          icon="invoice"
        />
      </Tip>
    );
  };

  render() {
    const { invoice, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(invoice, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
      this.props.onClick(invoice._id);
    };

    const onTrClick = e => {
      if (e.target.className.includes('icon-invoice')) {
        return;
      }

      e.stopPropagation();
      this.props.onClick(invoice._id);
    };

    const renderPluginItemName = data => {
      const keys = [
        'title',
        'name',
        'text',
        'content',
        'description',
        'number'
      ];

      for (const key of keys) {
        if (data[key]) {
          return data[key];
        }
      }

      return 'NA';
    };

    const {
      payment,
      amount,
      contentType,
      description,
      createdAt,
      resolvedAt,
      customer,
      customerType,
      status,
      pluginData
    } = invoice;

    let labelStyle = 'danger';

    switch (status) {
      case 'paid':
        labelStyle = 'success';
        break;
      case 'pending':
        labelStyle = 'warning';
        break;
      default:
        labelStyle = 'danger';
    }

    const renderCustomerName = () => {
      if (!customer) {
        return '-';
      }

      if (customerType === 'user') {
        return renderUserFullName(customer);
      }

      if (customerType === 'company') {
        return customer.primaryName || customer.website || '-';
      }

      return renderFullName(customer);
    };

    const meta: any = PAYMENTCONFIGS.find(p => p.kind === payment.kind);
    const kind = meta ? meta.name : 'NA';

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{payment ? payment.name : 'NA'}</td>
        <td>{kind}</td>
        <td>{amount.toLocaleString()}</td>
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>
        <td>{renderCustomerName()}</td>
        <td>{customerType}</td>
        <td>{description}</td>
        <td>
          <Icon icon="calender" />{' '}
          <DateWrapper>{dayjs(createdAt).format('ll')}</DateWrapper>
        </td>
        <td>
          <Icon icon="calender" />{' '}
          {resolvedAt ? (
            <DateWrapper>{dayjs(resolvedAt).format('ll')}</DateWrapper>
          ) : (
            '--- --, ----'
          )}
        </td>
        <td>
          <ActionButtons>
            {invoice.status === 'pending' && this.renderCheckAction()}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
