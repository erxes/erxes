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
import { IAssignment } from '../types';
import { IAssignmentCampaign } from '../../../configs/assignmentCampaign/types';
import { IQueryParams } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import { FormControl, ModalTrigger } from '@erxes/ui/src/components';

type Props = {
  assignment: IAssignment;
  currentCampaign?: IAssignmentCampaign;
  history: any;
  isChecked: boolean;
  toggleBulk: (assignment: IAssignment, isChecked?: boolean) => void;
  queryParams: IQueryParams;
};

class AssignmentRow extends React.Component<Props> {
  displayValue(assignment, name) {
    const value = _.get(assignment, name);

    if (name === 'primaryName') {
      return <FlexItem>{formatValue(assignment.primaryName)}</FlexItem>;
    }

    return formatValue(value);
  }

  onChange = e => {
    const { toggleBulk, assignment } = this.props;
    if (toggleBulk) {
      toggleBulk(assignment, e.target.checked);
    }
  };

  renderOwner = () => {
    const { assignment } = this.props;
    if (!assignment.owner || !assignment.owner._id) {
      return '-';
    }

    if (assignment.ownerType === 'customer') {
      return (
        <FlexItem>
          <Link to={`/contacts/details/${assignment.ownerId}`}>
            {formatValue(renderFullName(assignment.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (assignment.ownerType === 'user') {
      return (
        <FlexItem>
          <Link to={`/settings/team/details/${assignment.ownerId}`}>
            {formatValue(renderUserFullName(assignment.owner))}
          </Link>
        </FlexItem>
      );
    }

    if (assignment.ownerType === 'company') {
      return (
        <FlexItem>
          <Link to={`/companies/details/${assignment.ownerId}`}>
            {formatValue(this.displayValue(assignment.owner, 'name'))}
          </Link>
        </FlexItem>
      );
    }

    return '';
  };

  modalContent = props => {
    const { assignment } = this.props;

    const updatedProps = {
      ...props,
      assignment
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { assignment, isChecked, currentCampaign } = this.props;

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
        <td key={'createdAt'}>{dayjs(assignment.createdAt).format('lll')} </td>
        <td key={'ownerType'}>{this.displayValue(assignment, 'ownerType')}</td>
        <td key={'ownerId'} onClick={onClick}>
          {this.renderOwner()}
        </td>
        <td key={'status'}>
          {this.displayValue(assignment, 'assignmentScore')}
        </td>
        <td key={'actions'} onClick={onClick}>
          .
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        title={`Edit assignment`}
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default AssignmentRow;
