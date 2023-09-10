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
import { IDonate } from '../types';
import { IDonateCampaign } from '../../../configs/donateCampaign/types';
import { IQueryParams } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import { FormControl, ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  donate: IDonate;
  currentCampaign?: IDonateCampaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (donate: IDonate, isChecked?: boolean) => void;
  queryParams: IQueryParams;
};

class DonateRow extends React.Component<Props> {
  displayValue(donate, name) {
    const value = _.get(donate, name);

    if (name === 'primaryName') {
      return <FlexItem>{formatValue(donate.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  onChange = e => {
    const { toggleBulk, donate } = this.props;
    if (toggleBulk) {
      toggleBulk(donate, e.target.checked);
    }
  };

  renderOwner = () => {
    const { donate } = this.props;
    if (!donate.owner || !donate.owner._id) {
      return '-';
    }

    if (donate.ownerType === 'customer') {
      return (
        <FlexItem>
          <Link to={`/contacts/details/${donate.ownerId}`}>
            {formatValue(renderFullName(donate.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (donate.ownerType === 'user') {
      return (
        <FlexItem>
          <Link to={`/settings/team/details/${donate.ownerId}`}>
            {formatValue(renderUserFullName(donate.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (donate.ownerType === 'company') {
      return (
        <FlexItem>
          <Link to={`/companies/details/${donate.ownerId}`}>
            {formatValue(this.displayValue(donate.owner, 'name'))}
          </Link>
        </FlexItem>
      );
    }

    return '';
  };

  modalContent = props => {
    const { donate } = this.props;

    const updatedProps = {
      ...props,
      donate
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { donate, isChecked, currentCampaign } = this.props;

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
        <td key={'createdAt'}>{dayjs(donate.createdAt).format('lll')} </td>
        <td key={'ownerType'}>{this.displayValue(donate, 'ownerType')}</td>
        <td key={'ownerId'} onClick={onClick}>
          {this.renderOwner()}
        </td>
        <td key={'status'}>{this.displayValue(donate, 'donateScore')}</td>
        <td key={'actions'} onClick={onClick}>
          .
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Edit donate`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default DonateRow;
