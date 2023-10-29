import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React from 'react';

import GoalTypeForm from '../containers/goalForm';
import { IGoalType } from '../types';

import GoalView from './goalView';
type Props = {
  goalType: IGoalType;
  history: any;
  isChecked: boolean;
  toggleBulk: (goalType: IGoalType, isChecked?: boolean) => void;
};

type State = {
  showModal: boolean;
  checkbox: boolean;
};

function displayValue(goalType, name) {
  const value = _.get(goalType, name);

  return formatValue(value);
}

function renderFormTrigger(trigger: React.ReactNode, goalType: IGoalType) {
  const content = props => <GoalTypeForm {...props} goalType={goalType} />;

  return (
    <ModalTrigger
      size="lg"
      title="Edit Goal type"
      trigger={trigger}
      content={content}
    />
  );
}
function renderFormTViewrigger(trigger: React.ReactNode, goalType: IGoalType) {
  const content = props => (
    <GoalView {...props} goalType={goalType} _id={goalType._id} />
  );

  return (
    <ModalTrigger
      size="lg"
      title="View Goal"
      trigger={trigger}
      content={content}
    />
  );
}

function renderEditAction(goalType: IGoalType) {
  const trigger = <Button btnStyle="link" icon="edit-1" />;

  return renderFormTrigger(trigger, goalType);
}
function renderViewAction(goalType: IGoalType) {
  const trigger = <Button btnStyle="link" icon="eye" />;
  return renderFormTViewrigger(trigger, goalType);
}

function GoalRow(
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
      <td key={'boardName'}>{displayValue(goalType, 'boardName')}</td>
      <td key={'pipelineName'}>{displayValue(goalType, 'pipelineName')}</td>
      <td key={'stageName'}>{displayValue(goalType, 'stageName')}</td>
      <td key={'contributionType'}>
        {displayValue(goalType, 'contributionType')}
      </td>
      <td key={'frequency'}>{displayValue(goalType, 'frequency')}</td>
      <td key={'metric'}>{displayValue(goalType, 'metric')}</td>
      <td key={'goalType'}>{displayValue(goalType, 'goalType')}</td>
      <td key={'startDate'}>{displayValue(goalType, 'startDate')}</td>
      <td key={'endDate'}>{displayValue(goalType, 'endDate')}</td>
      <td key={'current'}>{displayValue(goalType.progress, 'current')}</td>
      <td key={'target'}>{displayValue(goalType, 'target')}</td>
      <td key={'progress'}>{displayValue(goalType.progress, 'progress')}</td>
      <td>{renderViewAction(goalType)}</td>
      <td>{renderEditAction(goalType)}</td>
    </tr>
  );
}

export default GoalRow;
