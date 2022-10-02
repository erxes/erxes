import { FormControl } from '@erxes/ui/src/components/form';
import React from 'react';
import { IInvoice } from '../types';
import Label from '@erxes/ui/src/components/Label';

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

    const {
      type,
      amount,
      contentType,
      comment,
      status,
      createdAt,
      paymentDate,
      customer,
      company
    } = invoice;

    return (
      <tr onClick={onTrClick}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{type}</td>
        <td>{amount}</td>
        <td>{contentType}</td>
        <td>{status}</td>
        <td>{customer ? customer.firstName : '-'}</td>
        <td>{company ? company.companyName : '-'}</td>
        <td>{comment}</td>
        <td>{createdAt}</td>
        <td>{paymentDate}</td>
      </tr>
    );
  }
}

export default Row;
