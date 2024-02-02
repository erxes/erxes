import { gql } from '@apollo/client';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, Alert } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React, { useEffect, useReducer } from 'react';
import {
  CONTRIBUTION,
  ENTITY,
  GOAL_STRUCTURE,
  GOAL_TYPE,
  SPECIFIC_PERIOD_GOAL,
} from '../constants';
import { IGoalType, IGoalTypeDoc } from '../types';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectUnits from '@erxes/ui/src/team/containers/SelectUnits';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalType: IGoalType;
  closeModal: () => void;
  pipelineLabels?: IPipelineLabel[];
  segmentIds: string[];
};

type State = {
  specificPeriodGoals: Array<{
    _id: string;
    addMonthly: string;
    addTarget: number;
  }>;
  periodGoal: string | undefined;
  entity: string;
  teamGoalType: string | undefined;
  contributionType: string;
  metric: string;
  target: number;
  goalTypeChoose: string;
  startDate: Date;
  endDate: Date;
  period: boolean | undefined;
  contribution: string | undefined;
  branch: string[];
  department: string[];
  unit: string[];
  pipelineLabels: IPipelineLabel[] | undefined;
  stageId?: any;
  pipelineId?: any;
  boardId: any;
  segmentIds: any;
  stageRadio: boolean | undefined;
  segmentRadio: boolean | undefined;
};

const initialState: State = {
  segmentIds: [],
  branch: [],
  department: [],
  unit: [],
  specificPeriodGoals: [],
  stageRadio: undefined,
  periodGoal: undefined,
  segmentRadio: undefined,
  contribution: undefined,
  pipelineLabels: undefined,
  entity: ENTITY[0].value,
  teamGoalType: undefined,
  contributionType: CONTRIBUTION[0].value,
  goalTypeChoose: GOAL_TYPE[0],
  metric: 'Value',
  period: undefined,
  startDate: new Date(),
  endDate: new Date(),
  stageId: undefined,
  pipelineId: undefined,
  boardId: undefined,
  target: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateState':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const goalForm = (props: Props) => {
  const { goalType, closeModal, renderButton } = props;

  const [state, dispatch] = useReducer(reducer, initialState);

  console.log(goalType);

  useEffect(() => {
    dispatch({ type: 'updateState', payload: goalType });
  }, [goalType]);

  const generateDoc = (values: { _id: string } & IGoalTypeDoc) => {
    const {
      startDate,
      endDate,
      stageId,
      pipelineId,
      boardId,
      contribution,
      stageRadio,
      segmentRadio,
      period,
      specificPeriodGoals,
      segmentIds,
      entity,
      department,
      unit,
      branch,
      contributionType,
      metric,
      target,
      goalTypeChoose,
      teamGoalType,
      pipelineLabels,
      periodGoal,
    } = state;
    const finalValues = values;
    if (goalType) {
      finalValues._id = goalType._id;
    }

    return {
      _id: finalValues._id,
      ...state,
      entity,
      department,
      unit,
      branch,
      segmentIds,
      specificPeriodGoals, // Renamed the property
      stageRadio,
      segmentRadio,
      stageId,
      pipelineId,
      boardId,
      contribution,
      period,
      contributionType,
      metric,
      goalType: goalTypeChoose,
      teamGoalType,
      pipelineLabels,
      periodGoal,
      startDate,
      endDate,
      target,
    };
  };

  const onChangeStartDate = (value) => {
    dispatch({ type: 'updateState', payload: { startDate: value } });
  };

  const onChangeEndDate = (value) => {
    dispatch({
      type: 'updateState',
      payload: { endDate: value, periodGoal: state.periodGoal || 'Weekly' },
    });
  };

  const onChangeTargetPeriod = (event) => {
    const { value } = event.target;
    const parsedValue = parseInt(value);
    dispatch({ type: 'updateState', payload: { target: parsedValue } });
    // if (!isNaN(parsedValue)) {

    // }
    //  else {
    //   // Handle the case where the value is not a valid integer
    //   // You might want to set the state to a default value or display an error message
    //   this.setState({ target: 0 }); // Set a default value of 0
    //   dispatch({ type: 'updateTargetPeriod', payload: { target: 0 } });
    //   // You can also display an error message to the user
    // }
  };

  const onChangeBranchId = (value) => {
    dispatch({ type: 'updateState', payload: { branch: value } });
  };
  const onChangeDepartments = (value) => {
    dispatch({ type: 'updateState', payload: { department: value } });
  };
  const onChangeUnites = (value) => {
    dispatch({ type: 'updateState', payload: { unit: value } });
  };

  const onChangeStage = (stgId) => {
    dispatch({ type: 'updateState', payload: { stageId: stgId } });
  };

  const onChangePipeline = (plId) => {
    client
      .query({
        query: gql(pipelineQuery.pipelineLabels),
        fetchPolicy: 'network-only',
        variables: { pipelineId: plId },
      })
      .then((data) => {
        dispatch({
          type: 'updateState',
          payload: { pipelineLabels: data.data.pipelineLabels },
        });
      })
      .catch((e) => {
        Alert.error(e.message);
      });

    dispatch({ type: 'updateState', payload: { pipelineId: plId } });
  };

  const onChangeBoard = (brId) => {
    dispatch({ type: 'updateState', payload: { boardId: brId } });
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;

    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : (e.target as HTMLInputElement).value;

    dispatch({ type: 'updateState', payload: { [name]: value } });
  };

  const onUserChange = (userId) => {
    dispatch({ type: 'updateState', payload: { contribution: userId } });
  };

  const onChangeSegments = (values) => {
    dispatch({ type: 'updateState', payload: { segmentIds: values } });
  };

  const onChangeTarget = (date, event) => {
    const { startDate, endDate, specificPeriodGoals, periodGoal } = state;
    const { value } = event.target;
    const parsedValue = parseInt(value);
    const updatedSpecificPeriodGoals = specificPeriodGoals.map((goal) =>
      goal.addMonthly === date ? { ...goal, addTarget: parsedValue } : goal,
    );
    // Add new periods to specificPeriodGoals if they don't exist
    const periods =
      periodGoal === 'Monthly'
        ? mapMonths(startDate, endDate)
        : mapWeeks(startDate, endDate);

    periods.forEach((period) => {
      const exists = updatedSpecificPeriodGoals.some(
        (goal) => goal.addMonthly === period,
      );
      if (!exists) {
        updatedSpecificPeriodGoals.push({
          _id: Math.random().toString(),
          addMonthly: period,
          addTarget: NaN,
        });
      }
    });

    // Update the state with the modified specificPeriodGoals
    const filteredGoals = updatedSpecificPeriodGoals.filter(
      (goal) =>
        (periodGoal === 'Monthly' && goal.addMonthly.includes('Month')) ||
        (periodGoal === 'Weekly' && goal.addMonthly.includes('Week')),
    );

    dispatch({
      type: 'updateState',
      payload: { specificPeriodGoals: filteredGoals },
    });
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;
    const { startDate, endDate } = state;
    const months: string[] = mapMonths(startDate, endDate);
    const weeks = mapWeeks(startDate, endDate);

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('choose Entity')}</ControlLabel>
              <FormControl
                {...formProps}
                name="entity"
                componentClass="select"
                value={state.entity}
                onChange={onChangeField}
              >
                {ENTITY.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <FormControl
                {...formProps}
                componentClass="checkbox" // Use 'input' for checkboxes
                name="stageRadio"
                checked={state.stageRadio}
                onChange={onChangeField}
                inline={true}
              >
                {__('Stage')}
              </FormControl>
              <FormControl
                {...formProps}
                componentClass="checkbox" // Use 'input' for checkboxes
                name="segmentRadio"
                checked={state.segmentRadio}
                onChange={onChangeField}
                inline={true}
              />
              {__('Segment')}
            </FormGroup>
            {state.segmentRadio === true && (
              <FormGroup>
                {isEnabled('segments') && isEnabled('contacts') && (
                  <>
                    <FormGroup>
                      <ControlLabel>Segments</ControlLabel>
                      <SelectSegments
                        name="segmentIds"
                        label="Choose segments"
                        contentTypes={[`cards:${state.entity}`]}
                        initialValue={state.segmentIds}
                        multi={true}
                        onSelect={(segmentIds) => onChangeSegments(segmentIds)}
                      />
                    </FormGroup>
                  </>
                )}
              </FormGroup>
            )}
            {state.stageRadio === true && (
              <FormGroup>
                {isEnabled('cards') && (
                  <BoardSelect
                    type={state.entity}
                    stageId={state.stageId}
                    pipelineId={state.pipelineId}
                    boardId={state.boardId}
                    onChangeStage={onChangeStage}
                    onChangePipeline={onChangePipeline}
                    onChangeBoard={onChangeBoard}
                  />
                )}
              </FormGroup>
            )}
            <FormGroup>
              <ControlLabel>{__('start duration')}:</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={false}
                  name="date"
                  value={state.startDate}
                  onChange={onChangeStartDate}
                />
              </DateContainer>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('end duration')}:</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={false}
                  name="date"
                  value={state.endDate}
                  onChange={onChangeEndDate}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel>{__('choose goalType type')}</ControlLabel>
              <FormControl
                {...formProps}
                name="goalTypeChoose"
                componentClass="select"
                value={state.goalTypeChoose}
                onChange={onChangeField}
              >
                {GOAL_TYPE.map((typeName, index) => (
                  <option key={index} value={typeName}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('contribution type')}</ControlLabel>
              <FormControl
                {...formProps}
                name="contributionType"
                componentClass="select"
                value={state.contributionType}
                onChange={onChangeField}
              >
                {CONTRIBUTION.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            {state.contributionType === 'person' && (
              <FormGroup>
                <ControlLabel>contribution</ControlLabel>
                <SelectTeamMembers
                  label="Choose users"
                  name="userId"
                  customOption={{ label: 'Choose user', value: '' }}
                  initialValue={state.contribution || ''}
                  onSelect={onUserChange}
                  multi={false}
                />
              </FormGroup>
            )}
            {state.contributionType === 'team' && (
              <FormGroup>
                <ControlLabel>{__('Choose Structure')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="teamGoalType"
                  componentClass="select"
                  value={state.teamGoalType}
                  onChange={onChangeField}
                >
                  {GOAL_STRUCTURE.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            )}
            {state.teamGoalType === 'Departments' &&
              state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Departments')}</ControlLabel>
                  <SelectDepartments
                    name="branchId"
                    label={__('Choose Departments')}
                    initialValue={state?.department}
                    onSelect={onChangeDepartments}
                    multi={false}
                  />
                </FormGroup>
              )}
            {state.teamGoalType === 'Units' &&
              state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Units')}</ControlLabel>
                  <SelectUnits
                    name="branchId"
                    label={__('Choose Units')}
                    initialValue={state?.unit}
                    onSelect={onChangeUnites}
                    multi={false}
                  />
                </FormGroup>
              )}
            {state.teamGoalType === 'Branches' &&
              state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Branches')}</ControlLabel>
                  <SelectBranches
                    name="branchId"
                    label={__('Choose Branches')}
                    initialValue={state?.branch}
                    onSelect={onChangeBranchId}
                    multi={false}
                  />
                </FormGroup>
              )}
            <FormGroup>
              <ControlLabel>{__('metric')}:</ControlLabel>
              <FormControl
                {...formProps}
                name="metric"
                componentClass="select"
                value={state.metric}
                onChange={onChangeField}
              >
                {['Value', 'Count'].map((typeName, index) => (
                  <option key={index} value={typeName}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('Target')}</ControlLabel>
              <FormGroup>
                <FormControl
                  type="number"
                  name="target"
                  value={
                    state.target !== undefined && state.target !== null
                      ? state.target
                      : 0
                  }
                  onChange={onChangeTargetPeriod}
                />
              </FormGroup>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('choose specific period goals')}</ControlLabel>
              <FormControl
                {...formProps}
                name="periodGoal"
                componentClass="select"
                value={state.periodGoal}
                onChange={onChangeField}
              >
                {SPECIFIC_PERIOD_GOAL.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        {state.periodGoal === 'Monthly' && (
          <div>
            {months.map((month) => (
              <FormWrapper key={month}>
                <FormColumn>
                  <ControlLabel>{__('Period (Monthly)')}</ControlLabel>
                  <FormGroup>
                    <DateContainer>{month}</DateContainer>
                  </FormGroup>
                </FormColumn>
                <FormColumn>
                  <ControlLabel>{__('Target')}</ControlLabel>
                  <FormGroup>
                    <FormControl
                      type="number"
                      name="target"
                      value={
                        state.specificPeriodGoals.find(
                          (goal) => goal.addMonthly === month,
                        )?.addTarget
                      }
                      onChange={(event) => onChangeTarget(month, event)}
                    />
                  </FormGroup>
                </FormColumn>
              </FormWrapper>
            ))}
          </div>
        )}
        {state.periodGoal === 'Weekly' && (
          <div>
            {weeks.map((week) => (
              <FormWrapper key={week}>
                <FormColumn>
                  <ControlLabel>{__('Period (Weekly)')}</ControlLabel>
                  <FormGroup>
                    <DateContainer>{week}</DateContainer>
                  </FormGroup>
                </FormColumn>
                <FormColumn>
                  <ControlLabel>{__('Target')}</ControlLabel>
                  <FormGroup>
                    <FormControl
                      type="number"
                      name="target"
                      value={
                        state.specificPeriodGoals.find(
                          (goal) => goal.addMonthly === week,
                        )?.addTarget
                      }
                      onChange={(event) => onChangeTarget(week, event)}
                    />
                  </FormGroup>
                </FormColumn>
              </FormWrapper>
            ))}
          </div>
        )}
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>
          {renderButton({
            name: 'goalType',
            values: generateDoc(values),
            isSubmitted,
            object: goalType,
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

const mapMonths = (startDate, endDate): string[] => {
  const startDateObject = new Date(startDate); // Ensure startDate is a Date object
  const endDateObject = new Date(endDate); // Ensure endDate is a Date object
  const startMonth = startDateObject.getMonth();
  const endMonth = endDateObject.getMonth();
  const year = startDateObject.getFullYear(); //
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const months: string[] = [];

  for (let i = startMonth; i <= endMonth; i++) {
    months.push(`Month of ${monthNames[i]} ${year}`);
  }
  return months;
};

const mapWeeks = (startDate, endDate): string[] => {
  const weeks: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const currentDate = new Date(start);

  while (currentDate <= end) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekString = `Week of ${weekStart.toDateString()} - ${weekEnd.toDateString()}`;

    weeks.push(weekString);

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

export default goalForm;
