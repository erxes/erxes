import { FormControl, TextInfo, ModalTrigger, Icon } from '@erxes/ui/src/components';
import React from 'react';
import { VOUCHER_TYPES } from '../../../constants';
import Form from '../containers/Form';
import { IVoucherCompaign } from '../types';
import { Link } from 'react-router-dom';

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
      voucherType,
      startDate,
      endDate,
      finishDateOfUse,
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
        <td>{new Date(finishDateOfUse).toLocaleDateString()}</td>
        <td>{VOUCHER_TYPES[voucherType].label}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
        <td onClick={onClick}>
          <Link to={`/erxes-plugin-loyalty/vouchers?compaignId=${_id}`}>
            <Icon icon='list-2' />
          </Link>
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
