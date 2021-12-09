import { FormControl, TextInfo, ModalTrigger } from 'erxes-ui';
import React from 'react';
import Form from '../containers/Form';
import { IVoucherCompaign } from '../types';

type Props = {
  voucherCompaign: IVoucherCompaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (voucherCompaign: IVoucherCompaign, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = props => {
    const { voucherCompaign } = this.props;

    const updatedProps = {
      ...props,
      voucherCompaign
    }

    return (
      <Form {...updatedProps} />
    )
  };

  render() {
    const { voucherCompaign, history, toggleBulk, isChecked } = this.props;

    const onChange = e => {
      if (toggleBulk) {
        toggleBulk(voucherCompaign, e.target.checked);
      }
    };

    const onClick = e => {
      e.stopPropagation();
    };

    const {
      _id,
      title,
      startDate,
      endDate,
      status,

    } = voucherCompaign;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{title}</td>
        <td>{new Date(startDate).toLocaleDateString()}</td>
        <td>{new Date(endDate).toLocaleDateString()}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
      </tr>
    )

    return (
      <ModalTrigger
        size={'lg'}
        title="Edit voucher compaign"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />

    );
  }
}

export default Row;
