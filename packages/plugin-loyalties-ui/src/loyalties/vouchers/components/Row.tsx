import * as dayjs from 'dayjs';
import _ from 'lodash';
import Form from '../containers/Form';
import React from 'react';
import { FlexItem } from '../../common/styles';
import {
  formatValue,
  renderFullName,
  renderUserFullName
} from '@erxes/ui/src/utils';
import { FormControl } from '@erxes/ui/src/components/form';
import { IQueryParams } from '@erxes/ui/src/types';
import { IVoucher } from '../types';
import { IVoucherCampaign } from '../../../configs/voucherCampaign/types';
import { Link } from 'react-router-dom';
import { ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  voucher: IVoucher;
  currentCampaign?: IVoucherCampaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (voucher: IVoucher, isChecked?: boolean) => void;
  queryParams: IQueryParams;
};

class VoucherRow extends React.Component<Props> {
  displayValue(voucher, name) {
    const value = _.get(voucher, name);

    if (name === 'primaryName') {
      return <FlexItem>{formatValue(voucher.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  onChange = e => {
    const { toggleBulk, voucher } = this.props;
    if (toggleBulk) {
      toggleBulk(voucher, e.target.checked);
    }
  };

  renderOwner = () => {
    const { voucher } = this.props;
    if (!voucher.owner || !voucher.owner._id) {
      return '-';
    }

    if (voucher.ownerType === 'customer') {
      return (
        <FlexItem>
          <Link to={`/contacts/details/${voucher.ownerId}`}>
            {formatValue(renderFullName(voucher.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (voucher.ownerType === 'user') {
      return (
        <FlexItem>
          <Link to={`/settings/team/details/${voucher.ownerId}`}>
            {formatValue(renderUserFullName(voucher.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (voucher.ownerType === 'company') {
      return (
        <FlexItem>
          <Link to={`/companies/details/${voucher.ownerId}`}>
            {formatValue(this.displayValue(voucher.owner, 'name'))}
          </Link>
        </FlexItem>
      );
    }

    return '';
  };

  modalContent = props => {
    const { voucher } = this.props;

    const updatedProps = {
      ...props,
      voucher
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { voucher, isChecked, currentCampaign } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    const renderCheckbox = () => {
      if (
        !currentCampaign ||
        ['spin', 'lottery'].includes(currentCampaign.voucherType)
      ) {
        return;
      }
      return (
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={this.onChange}
          />
        </td>
      );
    };

    const trigger = (
      <tr>
        {renderCheckbox()}
        <td key={'createdAt'}>{dayjs(voucher.createdAt).format('lll')} </td>
        <td key={'ownerType'}>{this.displayValue(voucher, 'ownerType')}</td>
        <td key={'ownerId'} onClick={onClick}>
          {this.renderOwner()}
        </td>
        <td key={'status'}>{this.displayValue(voucher, 'status')}</td>
        <td key={'actions'} onClick={onClick}>
          .
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Edit voucher`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default VoucherRow;
