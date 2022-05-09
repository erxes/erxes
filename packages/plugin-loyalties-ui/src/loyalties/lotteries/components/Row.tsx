import * as dayjs from 'dayjs';
import _ from 'lodash';
import Form from '../containers/Form';
import React from 'react';
import { FlexItem } from '../../common/styles';
import {
  formatValue,
  FormControl,
  renderFullName,
  renderUserFullName
} from '@erxes/ui/src';
import { ILottery } from '../types';
import { ILotteryCampaign } from '../../../configs/lotteryCampaign/types';
import { IQueryParams } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import { ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  lottery: ILottery;
  currentCampaign?: ILotteryCampaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (lottery: ILottery, isChecked?: boolean) => void;
  queryParams: IQueryParams;
};

class LotteryRow extends React.Component<Props> {
  displayValue(lottery, name) {
    const value = _.get(lottery, name);

    if (name === 'primaryName') {
      return <FlexItem>{formatValue(lottery.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  onChange = e => {
    const { toggleBulk, lottery } = this.props;
    if (toggleBulk) {
      toggleBulk(lottery, e.target.checked);
    }
  };

  renderOwner = () => {
    const { lottery } = this.props;
    if (!lottery.owner || !lottery.owner._id) {
      return '-';
    }

    if (lottery.ownerType === 'customer') {
      return (
        <FlexItem>
          <Link to={`/contacts/details/${lottery.ownerId}`}>
            {formatValue(renderFullName(lottery.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (lottery.ownerType === 'user') {
      return (
        <FlexItem>
          <Link to={`/settings/team/details/${lottery.ownerId}`}>
            {formatValue(renderUserFullName(lottery.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (lottery.ownerType === 'company') {
      return (
        <FlexItem>
          <Link to={`/companies/details/${lottery.ownerId}`}>
            {formatValue(this.displayValue(lottery.owner, 'name'))}
          </Link>
        </FlexItem>
      );
    }

    return '';
  };

  modalContent = props => {
    const { lottery } = this.props;

    const updatedProps = {
      ...props,
      lottery
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { lottery, isChecked } = this.props;

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
        <td key={'createdAt'}>{dayjs(lottery.createdAt).format('lll')} </td>
        <td key={'number'}>{this.displayValue(lottery, 'number')}</td>
        <td key={'ownerType'}>{this.displayValue(lottery, 'ownerType')}</td>
        <td key={'ownerId'} onClick={onClick}>
          {this.renderOwner()}
        </td>
        <td key={'status'}>{this.displayValue(lottery, 'status')}</td>
        <td key={'actions'} onClick={onClick}>
          .
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Edit lottery`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default LotteryRow;
