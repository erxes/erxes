import { Button, formatValue, FormControl, ModalTrigger } from '@erxes/ui/src';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';

import GoalTypeForm from '../containers/goalForm';
import { IGoalType } from '../types';
import { mutations, queries } from '../graphql';
import { gql, useQuery, useMutation } from '@apollo/client';
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
  pipName: string;
  boardName: string;
  stageName: string;
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
function renderFormTViewrigger(
  trigger: React.ReactNode,
  goalType: IGoalType,
  boardName: string,
  pipelineName: string,
  stageName: string,
  emailName: string
) {
  const content = props => (
    <GoalView
      {...props}
      goalType={goalType}
      _id={goalType._id}
      boardName={boardName}
      pipelineName={pipelineName}
      stageName={stageName}
      emailName={emailName}
    />
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
function renderViewAction(
  goalType: IGoalType,
  boardName: string,
  pipelineName: string,
  stageName: string,
  emailName: string
) {
  const trigger = <Button btnStyle="link" icon="eye" />;
  return renderFormTViewrigger(
    trigger,
    goalType,
    boardName,
    pipelineName,
    stageName,
    emailName
  );
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
  const [pipelineName, setPipelineName] = useState('');
  const [boardName, setBoardName] = useState('');
  const [stageName, setStageName] = useState('');
  const [emailName, setEmail] = useState('');

  const pipelineDetail = useQuery(gql(queries.pipelineDetail), {
    variables: {
      _id: goalType.pipelineId
    }
  });

  const boardDetail = useQuery(gql(queries.boardDetail), {
    variables: {
      _id: goalType.boardId
    }
  });

  const stageDetail = useQuery(gql(queries.stageDetail), {
    variables: {
      _id: goalType.stageId
    }
  });
  const userDetail = useQuery(gql(queries.userDetail), {
    variables: {
      _id: goalType.contribution[0]
    }
  });

  useEffect(() => {
    if (userDetail.data && userDetail.data.userDetail) {
      setEmail(userDetail.data.userDetail.email);
    }
    if (pipelineDetail.data && pipelineDetail.data.pipelineDetail) {
      setPipelineName(pipelineDetail.data.pipelineDetail.name);
    }
    if (boardDetail.data && boardDetail.data.boardDetail) {
      setBoardName(boardDetail.data.boardDetail.name);
    }
    if (stageDetail.data && stageDetail.data.stageDetail) {
      setStageName(stageDetail.data.stageDetail.name);
    }
  }, [
    pipelineDetail.data,
    boardDetail.data,
    stageDetail.data,
    userDetail.data
  ]);

  if (
    pipelineDetail.loading ||
    boardDetail.loading ||
    stageDetail.loading ||
    userDetail.loading
  ) {
    return null; // or a loading indicator
  }

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
      <td>{boardName}</td>
      <td>{pipelineName}</td>
      <td>{stageName}</td>
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
      <td>
        {renderViewAction(
          goalType,
          boardName,
          pipelineName,
          stageName,
          emailName
        )}
      </td>
      <td>{renderEditAction(goalType)}</td>
    </tr>
  );
}

export default GoalRow;
