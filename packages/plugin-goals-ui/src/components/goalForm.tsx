import { gql } from '@apollo/client';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import Select, { MultiValue, ActionMeta } from 'react-select';

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
  MainStyleScrollWrapper as ScrollWrapper
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
  SPECIFIC_PERIOD_GOAL
} from '../constants';
import { IGoalType, IGoalTypeDoc } from '../types';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectUnits from '@erxes/ui/src/team/containers/SelectUnits';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectTags from '@erxes/ui-tags/src/containers/SelectTags';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';

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
  name: string;
  entity: string;
  teamGoalType: string | undefined;
  contributionType: string;
  metric: string;
  goalTypeChoose: string;
  startDate: Date;
  endDate: Date;
  period: boolean | undefined;
  contribution: string | undefined;
  branch: string[];
  department: string[];
  companies: string[];
  tags: string[];
  tagsExcluded?: string[];
  unit: string[];
  pipelineLabels: IPipelineLabel[];
  stageId?: any;
  pipelineId?: any;
  boardId: any;
  segmentIds: any;
  stageRadio: boolean | undefined;
  segmentRadio: boolean | undefined;
  productIds: string[];
  selectedLabelIds: string[];
};

const initialState: State = {
  selectedLabelIds: [],
  productIds: [],
  segmentIds: [],
  branch: [],
  department: [],
  companies: [],
  tags: [],
  unit: [],
  specificPeriodGoals: [],
  stageRadio: undefined,
  periodGoal: undefined,
  segmentRadio: undefined,
  contribution: undefined,
  pipelineLabels: [],
  name: '',
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
  boardId: undefined
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
  console.log(props, 'asdkopasdkp');
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'updateState', payload: goalType });
  }, [goalType]);

  const generateDoc = (values: { _id: string } & IGoalTypeDoc) => {
    const {
      startDate,
      endDate,
      stageId,
      pipelineId,
      name,
      boardId,
      contribution,
      stageRadio,
      segmentRadio,
      period,
      specificPeriodGoals,
      segmentIds,
      pipelineLabels,
      productIds,
      entity,
      department,
      companyIds: companies,
      tags,
      unit,
      branch,
      contributionType,
      metric,
      goalTypeChoose,
      teamGoalType,
      periodGoal
    } = state;
    const finalValues = values;
    if (goalType) {
      finalValues._id = goalType._id;
    }

    if (!Array.isArray(state.pipelineLabels)) {
      console.error('pipelineLabels is not an array:', state.pipelineLabels);
      return [];
    }
    const transformedPipelineLabels = pipelineLabels
      .map((label) => {
        if (label && typeof label._id === 'string') {
          return label._id;
        } else {
          console.error('Invalid label:', label);
          return null; // or handle accordingly
        }
      })
      .filter((id) => id !== null); // Filter out any null values

    return {
      _id: finalValues._id,
      ...state,
      entity,
      department,
      companyIds: companies,
      tagsIds: tags,
      unit,
      branch,
      segmentIds,
      pipelineLabels: transformedPipelineLabels,
      productIds,
      specificPeriodGoals, // Renamed the property
      stageRadio,
      segmentRadio,
      stageId,
      pipelineId,
      name,
      boardId,
      contribution,
      period,
      contributionType,
      metric,
      goalType: goalTypeChoose,
      teamGoalType,
      periodGoal,
      startDate,
      endDate
    };
  };

  const onChangeStartDate = (value) => {
    dispatch({ type: 'updateState', payload: { startDate: value } });
  };

  const onChangeEndDate = (value) => {
    dispatch({
      type: 'updateState',
      payload: { endDate: value, periodGoal: state.periodGoal || 'Weekly' }
    });
  };

  const onChangeTargetPeriod = (event) => {
    const { value } = event.target;
    const parsedValue = parseInt(value);
    dispatch({ type: 'updateState', payload: { target: parsedValue } });
  };

  const onChangeBranchId = (value) => {
    dispatch({ type: 'updateState', payload: { branch: value } });
  };
  const labelOptions = (
    Array.isArray(state.pipelineLabels) ? state.pipelineLabels : []
  )
    .filter((label) => label !== null && label !== undefined)
    .map((label) => ({
      label: label.name || 'Unknown',
      value: label._id || ''
    }));

  const selectedLabelIds = state.selectedLabelIds || []; // Ensure this is always an array

  const onChangePipelineLabel = (
    newValue: MultiValue<{ value: string }>,
    actionMeta: ActionMeta<{ value: string }>
  ) => {
    const selectedValues = newValue
      ? (newValue as { value: string }[]).map((option) => option.value)
      : [];
    dispatch({
      type: 'updateState',
      payload: { selectedLabelIds: selectedValues }
    });
  };
  const selectedOptions = labelOptions.filter(
    (option) => selectedLabelIds.includes(option.name) // Ensure selectedLabelIds is an array
  );

  const onChangeDepartments = (value) => {
    dispatch({ type: 'updateState', payload: { department: value } });
  };
  const onChangeCompanies = (value) => {
    dispatch({
      type: 'updateState',
      payload: {
        companies: value
      }
    });
  };
  const onChangeTags = (value) => {
    dispatch({
      type: 'updateState',
      payload: {
        tags: value
      }
    });
  };
  const onChangeProduct = (value) => {
    dispatch({
      type: 'updateState',
      payload: {
        productIds: value
      }
    });
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
        variables: { pipelineId: plId }
      })
      .then((data) => {
        dispatch({
          type: 'updateState',
          payload: { pipelineLabels: data.data.pipelineLabels }
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
      goal.addMonthly === date ? { ...goal, addTarget: parsedValue } : goal
    );
    // Add new periods to specificPeriodGoals if they don't exist
    const periods =
      periodGoal === 'Monthly'
        ? mapMonths(startDate, endDate)
        : mapWeeks(startDate, endDate);

    periods.forEach((period) => {
      const exists = updatedSpecificPeriodGoals.some(
        (goal) => goal.addMonthly === period
      );
      if (!exists) {
        updatedSpecificPeriodGoals.push({
          _id: Math.random().toString(),
          addMonthly: period,
          addTarget: NaN
        });
      }
    });

    // Update the state with the modified specificPeriodGoals
    const filteredGoals = updatedSpecificPeriodGoals.filter(
      (goal) =>
        (periodGoal === 'Monthly' && goal.addMonthly.includes('Month')) ||
        (periodGoal === 'Weekly' && goal.addMonthly.includes('Week'))
    );

    dispatch({
      type: 'updateState',
      payload: { specificPeriodGoals: filteredGoals }
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
              <ControlLabel>{__('Name')}</ControlLabel>
              <FormControl
                name='name'
                value={state.name}
                onChange={onChangeField} // Directly pass the event handler
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('choose Entity')}</ControlLabel>
              <FormControl
                {...formProps}
                name='entity'
                componentclass='select'
                value={state.entity}
                onChange={onChangeField}>
                {ENTITY.map((item, index) => (
                  <option
                    key={index}
                    value={item.value}>
                    {item.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <FormControl
                {...formProps}
                componentclass='checkbox' // Use 'input' for checkboxes
                name='stageRadio'
                checked={state.stageRadio}
                onChange={onChangeField}
                inline={true}>
                {__('Stage')}
              </FormControl>
              <FormControl
                {...formProps}
                componentclass='checkbox' // Use 'input' for checkboxes
                name='segmentRadio'
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
                        name='segmentIds'
                        label='Choose segments'
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
                  name='date'
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
                  name='date'
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
                name='goalTypeChoose'
                componentclass='select'
                value={state.goalTypeChoose}
                onChange={onChangeField}>
                {GOAL_TYPE.map((typeName, index) => (
                  <option
                    key={index}
                    value={typeName}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('contribution type')}</ControlLabel>
              <FormControl
                {...formProps}
                name='contributionType'
                componentclass='select'
                value={state.contributionType}
                onChange={onChangeField}>
                {CONTRIBUTION.map((item, index) => (
                  <option
                    key={index}
                    value={item.value}>
                    {item.name}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            {state.contributionType === 'person' && (
              <FormGroup>
                <ControlLabel>contribution</ControlLabel>
                <SelectTeamMembers
                  label='Choose users'
                  name='userId'
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
                  name='teamGoalType'
                  componentclass='select'
                  value={state.teamGoalType}
                  onChange={onChangeField}>
                  {GOAL_STRUCTURE.map((item, index) => (
                    <option
                      key={index}
                      value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            )}
            {state.teamGoalType === 'Companies' &&
              state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Companies')}</ControlLabel>
                  <SelectCompanies
                    label='Choose an Companies'
                    name='parentCompanyId'
                    initialValue={goalType?.companyIds || state.companyIds}
                    onSelect={onChangeCompanies}
                    multi={true}
                  />
                </FormGroup>
              )}
            {state.teamGoalType === 'Departments' &&
              state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Departments')}</ControlLabel>
                  <SelectDepartments
                    name='branchId'
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
                    name='branchId'
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
                    name='branchId'
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
                name='metric'
                componentclass='select'
                value={state.metric}
                onChange={onChangeField}>
                {['Value', 'Count'].map((typeName, index) => (
                  <option
                    key={index}
                    value={typeName}>
                    {typeName}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
            <FormGroup>
              {isEnabled('tags') && (
                <>
                  <FormGroup>
                    <ControlLabel>{__('Tags')}</ControlLabel>
                    <SelectTags
                      tagsType={'cards:' + state.entity}
                      label='Choose an Tags'
                      name='tagsIds'
                      initialValue={goalType?.tagsIds || state.tagsIds}
                      onSelect={onChangeTags}
                      multi={true}
                    />
                  </FormGroup>
                </>
              )}
            </FormGroup>
            <FormGroup>
              <FormGroup>
                {isEnabled('products') && (
                  <>
                    <FormGroup>
                      <ControlLabel>{__('Product')}</ControlLabel>
                      <SelectProducts
                        label='Choose products'
                        name='productIds'
                        multi={true}
                        initialValue={goalType?.productIds || state.productIds}
                        onSelect={(productIds) => onChangeProduct(productIds)}
                      />
                    </FormGroup>
                  </>
                )}
              </FormGroup>
            </FormGroup>
            <FormGroup>
              <FormGroup>
                <FormGroup>
                  <ControlLabel>{__('Select labels')}</ControlLabel>
                  <Select
                    isMulti
                    name='labelIds'
                    options={labelOptions}
                    value={selectedOptions}
                    onChange={onChangePipelineLabel}
                  />
                </FormGroup>
              </FormGroup>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('choose specific period goals')}.</ControlLabel>
              <FormControl
                {...formProps}
                name='periodGoal'
                componentclass='select'
                value={state.periodGoal}
                onChange={onChangeField}>
                {SPECIFIC_PERIOD_GOAL.map((item, index) => (
                  <option
                    key={index}
                    value={item.value}>
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
                      type='number'
                      name='target'
                      value={
                        state.specificPeriodGoals.find(
                          (goal) => goal.addMonthly === month
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
                      type='number'
                      name='target'
                      value={
                        state.specificPeriodGoals.find(
                          (goal) => goal.addMonthly === week
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
          <Button
            btnStyle='simple'
            onClick={closeModal}
            icon='cancel-1'>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'goalType',
            values: generateDoc(values),
            isSubmitted,
            object: goalType
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

const mapMonths = (startDate: Date, endDate: Date): string[] => {
  const startDateObject = new Date(startDate);
  const endDateObject = new Date(endDate);
  const startMonth = startDateObject.getMonth();
  const startYear = startDateObject.getFullYear();
  const endMonth = endDateObject.getMonth();
  const endYear = endDateObject.getFullYear();

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
    'December'
  ];

  const months: string[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const start = year === startYear ? startMonth : 0;
    const end = year === endYear ? endMonth : 11;

    for (let month = start; month <= end; month++) {
      months.push(`Month of ${monthNames[month]} ${year}`);
    }
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
