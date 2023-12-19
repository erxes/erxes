import Assignees from '@erxes/ui-cards/src/boards/components/Assignees';
import {
  ActionButtons,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Label,
  Tip,
  Toggle,
  __
} from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { IPLan } from '../common/types';
import { DetailPopoverWrapper } from '../../styles';

import { DetailPopOver } from '../../assessments/common/utils';

type Props = {
  plan: IPLan;
  selectedItems: string[];
  handleSelect: (id: string) => void;
  queryParams: any;
  duplicate: (_id: string) => void;
  changeStatus: (_id: string, status: string) => void;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      plan,
      selectedItems,
      handleSelect,
      duplicate,
      changeStatus
    } = this.props;

    const onClick = e => {
      e.stopPropagation();
    };

    const handleStatus = () => {
      changeStatus(plan._id, plan.status === 'draft' ? 'active' : 'draft');
    };

    return (
      <tr>
        <td onClick={onClick}>
          <FormControl
            componentClass="checkbox"
            checked={selectedItems.includes(plan._id)}
            onClick={handleSelect.bind(this, plan._id)}
          />
        </td>
        <td>{__(plan.name)}</td>
        <td>
          <Assignees users={[plan?.planner]} limit={1} />
        </td>
        <td>
          <DetailPopoverWrapper>
            <DetailPopOver
              customComponent={<Label>{plan.status}</Label>}
              placement="left"
            >
              <FormGroup>
                <ControlLabel>{__('Change Plan Status')}</ControlLabel>
                <Toggle
                  checked={plan.status === 'active'}
                  onChange={handleStatus}
                />
              </FormGroup>
            </DetailPopOver>
          </DetailPopoverWrapper>
        </td>
        <td>{plan.createdAt ? moment(plan.createdAt).format('lll') : '-'}</td>
        <td>{plan.modifiedAt ? moment(plan.modifiedAt).format('lll') : '-'}</td>
        <td>
          <ActionButtons>
            <Link to={`/settings/risk-assessment-plans/edit/${plan._id}`}>
              <Button btnStyle="link">
                <Tip placement="bottom" text="Edit plan">
                  <Icon icon="edit-3" />
                </Tip>
              </Button>
            </Link>
            <Button btnStyle="link" onClick={duplicate.bind(this, plan._id)}>
              <Tip placement="bottom" text="Duplicate plan">
                <Icon icon="copy" />
              </Tip>
            </Button>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
