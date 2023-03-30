import { Icon } from '@erxes/ui/src/components';
import { FormControl } from '@erxes/ui/src/components/form';
import Label from '@erxes/ui/src/components/Label';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import React from 'react';

import { IInvoice } from '../../types';

type Props = {
  invoice: IInvoice;
  history: any;
  isChecked: boolean;
  toggleBulk: (invoice: IInvoice, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  render() {
    const { invoice, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(invoice, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const onTrClick = () => {
      history.push(`/processes/flows/details/${invoice._id}`);
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

    const renderName = () => {
      if (customer.name || customer.phone || customer.email) {
        return `${customer.name || ''} ${customer.phone ||
          ''} ${customer.email || ''}`;
      }

      return '-';
    };

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
        <td>{payment ? payment.kind : 'NA'}</td>
        <td>{amount.toFixed(2)}</td>

        {/* <td>{`${contentType.split(':')[0]} - ${pluginData &&
          renderPluginItemName(pluginData)}`}</td> */}
        <td>
          <Label lblStyle={labelStyle}>{status}</Label>
        </td>
        <td>{customer ? renderName() : '-'}</td>
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
      </tr>
    );
  }
}

export default Row;
