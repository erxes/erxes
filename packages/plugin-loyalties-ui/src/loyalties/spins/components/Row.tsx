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
import { IQueryParams } from '@erxes/ui/src/types';
import { ISpin } from '../types';
import { ISpinCampaign } from '../../../configs/spinCampaign/types';
import { Link } from 'react-router-dom';
import { FormControl, ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  spin: ISpin;
  currentCampaign?: ISpinCampaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (spin: ISpin, isChecked?: boolean) => void;
  queryParams: IQueryParams;
};

class SpinRow extends React.Component<Props> {
  displayValue(spin, name) {
    const value = _.get(spin, name);

    if (name === 'primaryName') {
      return <FlexItem>{formatValue(spin.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  onChange = e => {
    const { toggleBulk, spin } = this.props;
    if (toggleBulk) {
      toggleBulk(spin, e.target.checked);
    }
  };

  renderOwner = () => {
    const { spin } = this.props;
    if (!spin.owner || !spin.owner._id) {
      return '-';
    }

    if (spin.ownerType === 'customer') {
      return (
        <FlexItem>
          <Link to={`/contacts/details/${spin.ownerId}`}>
            {formatValue(renderFullName(spin.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (spin.ownerType === 'user') {
      return (
        <FlexItem>
          <Link to={`/settings/team/details/${spin.ownerId}`}>
            {formatValue(renderUserFullName(spin.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (spin.ownerType === 'company') {
      return (
        <FlexItem>
          <Link to={`/companies/details/${spin.ownerId}`}>
            {formatValue(this.displayValue(spin.owner, 'name'))}
          </Link>
        </FlexItem>
      );
    }

    return '';
  };

  modalContent = props => {
    const { spin } = this.props;

    const updatedProps = {
      ...props,
      spin
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { spin, isChecked } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentClass="checkbox"
            onChange={this.onChange}
          />
        </td>
        <td key={'createdAt'}>{dayjs(spin.createdAt).format('lll')} </td>
        <td key={'ownerType'}>{this.displayValue(spin, 'ownerType')}</td>
        <td key={'ownerId'} onClick={onClick}>
          {this.renderOwner()}
        </td>
        <td key={'status'}>{this.displayValue(spin, 'status')}</td>
        <td key={'actions'} onClick={onClick}>
          .
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Edit spin`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default SpinRow;
