import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';

import GoalTypeForm from '../containers/goalTypeForm';
import { IGoalType } from '../types';

type Props = {
  goalType: IGoalType;
  history: any;
  isChecked: boolean;
  toggleBulk: (goalType: IGoalType, isChecked?: boolean) => void;
};

type State = {
  showModal: boolean;
};

function displayValue(goalType, name) {
  const value = _.get(goalType, name);

  return formatValue(value);
}

function renderFormTrigger(trigger: React.ReactNode, goalType: IGoalType) {
  const content = props => <GoalTypeForm {...props} goalType={goalType} />;

  return (
    <ModalTrigger title="Edit Goal type" trigger={trigger} content={content} />
  );
}

function renderEditAction(goalType: IGoalType) {
  const trigger = <Button btnStyle="link" icon="edit-1" />;

  return renderFormTrigger(trigger, goalType);
}

function GoalTypeRow(
  { goalType, history, isChecked, toggleBulk }: Props,
  { showModal }: State
) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(goalType, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td key={'entity'}>{displayValue(goalType, 'entity')}</td>
      <td key={'contributionType'}>
        {displayValue(goalType, 'contributionType')}
      </td>
      <td key={'chooseBoard'}>{displayValue(goalType, 'chooseBoard')}</td>
      <td key={'frequency'}>{displayValue(goalType, 'frequency')}</td>
      <td key={'metric'}>{displayValue(goalType, 'metric')}</td>
      <td key={'goalType'}>{displayValue(goalType, 'goalType')}</td>
      <td key={'contribution'}>{displayValue(goalType, 'contribution')}</td>
      <td key={'startDate'}>{displayValue(goalType, 'startDate')}</td>
      <td key={'endDate'}>{displayValue(goalType, 'endDate')}</td>
      <td key={'target'}>{displayValue(goalType, 'target')}</td>
      <td>{renderEditAction(goalType)}</td>
    </tr>
  );
}

export default GoalTypeRow;
