import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';

import GoalTypeForm from '../containers/goalForm';
import { IGoal } from '../types';
import { check } from 'prettier';
import { Checkbox } from '@erxes/ui/src/components/form/styles';
import GoalView from './goalView';
type Props = {
  goal: IGoal;
  history: any;
  isChecked: boolean;
  toggleBulk: (goal: IGoal, isChecked?: boolean) => void;
};

type State = {
  showModal: boolean;
  checkbox: boolean;
};

function displayValue(goal, name) {
  const value = _.get(goal, name);

  return formatValue(value);
}

function renderFormTrigger(trigger: React.ReactNode, goal: IGoal) {
  const content = props => <GoalTypeForm {...props} goal={goal} />;

  return (
    <ModalTrigger
      size="lg"
      title="Edit Goal type"
      trigger={trigger}
      content={content}
    />
  );
}
function renderFormTViewrigger(trigger: React.ReactNode, goal: IGoal) {
  const content = props => <GoalView {...props} _id={goal._id} />;

  return (
    <ModalTrigger
      size="lg"
      title="View Goal"
      trigger={trigger}
      content={content}
    />
  );
}

function renderEditAction(goal: IGoal) {
  const trigger = <Button btnStyle="link" icon="edit-1" />;

  return renderFormTrigger(trigger, goal);
}
function renderViewAction(goal: IGoal) {
  const trigger = <Button btnStyle="link" icon="eye" />;
  return renderFormTViewrigger(trigger, goal);
}

function GoalRow(
  { goal, history, isChecked, toggleBulk }: Props,
  { showModal }: State
) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(goal, e.target.checked);
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

      <td key={'entity'}>{displayValue(goal, 'entity')}</td>
      <td key={'stageId'}>{displayValue(goal, 'stageId')}</td>
      <td key={'pipelineId'}>{displayValue(goal, 'pipelineId')}</td>
      <td key={'boardId'}>{displayValue(goal, 'boardId')}</td>
      <td key={'contributionType'}>{displayValue(goal, 'contributionType')}</td>
      <td key={'frequency'}>{displayValue(goal, 'frequency')}</td>
      <td key={'metric'}>{displayValue(goal, 'metric')}</td>
      <td key={'goal'}>{displayValue(goal, 'goal')}</td>
      <td key={'contribution'}>{displayValue(goal, 'contribution')}</td>
      <td key={'startDate'}>{displayValue(goal, 'startDate')}</td>
      <td key={'endDate'}>{displayValue(goal, 'endDate')}</td>
      <td key={'target'}>{displayValue(goal, 'target')}</td>
      <td key={'specificPeriodGoals'}>
        {displayValue(goal, 'specificPeriodGoals')}
      </td>
      <td>{renderViewAction(goal)}</td>
      <td>{renderEditAction(goal)}</td>
    </tr>
  );
}

export default GoalRow;
