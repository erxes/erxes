import { gql } from '@apollo/client';
import BoardSelect from '@erxes/ui-sales/src/boards/containers/BoardSelect';
import { queries as pipelineQuery } from '@erxes/ui-sales/src/boards/graphql';
import { IPipelineLabel } from '@erxes/ui-sales/src/boards/types';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import Select, { MultiValue, ActionMeta } from 'react-select';
import SalesBoardSelect from '@erxes/ui-sales/src/boards/containers/BoardSelect';
import TicketsBoardSelect from '@erxes/ui-tickets/src/boards/containers/BoardSelect';
import TasksBoardSelect from '@erxes/ui-tasks/src/boards/containers/BoardSelect';
import PurchasesBoardSelect from '@erxes/ui-purchases/src/boards/containers/BoardSelect';
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
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectTags from '@erxes/ui-tags/src/containers/SelectTags';
import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import { pipeline } from 'stream/promises';

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
  companyIds: string[];
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
  companyIds: [],
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
  boardId: undefined,
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

  useEffect(() => {
    dispatch({ type: 'updateState', payload: goalType });
  }, [goalType]);

  useEffect(() => {
    if (state.pipelineId) {
      client
        .query({
          query: gql(pipelineQuery.pipelineLabels),
          variables: { pipelineId: state.pipelineId },
        })
        .then((data) => {
          const fetchedLabels = data.data.pipelineLabels;
          const selectedLabels = goalType.pipelineLabels.map((label) => ({
            label: label.name,
            value: label._id,
          }));

          dispatch({
            type: 'updateState',
            payload: {
              pipelineLabels: fetchedLabels,
              selectedLabelIds: selectedLabels.map((label) => label.value),
            },
          });
        })
        .catch((e) => {
          console.error('Error while fetching pipeline labels: ', e.message);
        });
    }
  }, [state.pipelineId]);

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
      productIds,
      entity,
      department,
      companyIds,
      tags,
      unit,
      branch,
      contributionType,
      metric,
      goalTypeChoose,
      teamGoalType,
      periodGoal,
      selectedLabelIds,
      pipelineLabels,
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
      companyIds,
      tagsIds: tags,
      unit,
      branch,
      segmentIds,
      productIds,
      specificPeriodGoals,
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
      endDate,
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
  };

  const onChangeBranchId = (value) => {
    dispatch({ type: 'updateState', payload: { branch: value } });
  };

  const onChangePipelineLabel = (
    newValue: MultiValue<{ value: string }>,
    actionMeta: ActionMeta<{ value: string }>,
  ) => {
    const selectedValues = newValue
      ? newValue.map((option) => option.value)
      : [];

    dispatch({
      type: 'updateState',
      payload: { selectedLabelIds: selectedValues },
    });
  };

  const onChangeDepartments = (value) => {
    dispatch({ type: 'updateState', payload: { department: value } });
  };
  const onChangeCompanies = (value) => {
    dispatch({
      type: 'updateState',
      payload: {
        companyIds: value,
      },
    });
  };
  const onChangeTags = (value) => {
    dispatch({
      type: 'updateState',
      payload: {
        tags: value,
      },
    });
  };
  const onChangeProduct = (value) => {
    dispatch({
      type: 'updateState',
      payload: {
        productIds: value,
      },
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
              <ControlLabel>{__('Name')}</ControlLabel>
              <FormControl
                autoFocus={true}
                placeholder={__('Goal name')}
                name="name"
                value={state.name}
                onChange={onChangeField}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('choose Entity')}</ControlLabel>
              <FormControl
                {...formProps}
                name="entity"
                componentclass="select"
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
                componentclass="checkbox"
                name="stageRadio"
                checked={state.stageRadio}
                onChange={onChangeField}
                inline={true}
              >
                {__('Stage')}
              </FormControl>
              <FormControl
                {...formProps}
                componentclass="checkbox"
                name="segmentRadio"
                checked={state.segmentRadio}
                onChange={onChangeField}
                inline={true}
              />
              {__('Segment')}
            </FormGroup>
            {state.segmentRadio === true && (
              <FormGroup>
                <>
                  <FormGroup>
                    <ControlLabel>Segments</ControlLabel>
                    <SelectSegments
                      name="segmentIds"
                      label={__('Choose segments')}
                      contentTypes={[`cards:${state.entity}`]}
                      initialValue={state.segmentIds}
                      multi={true}
                      onSelect={(segmentIds) => onChangeSegments(segmentIds)}
                    />
                  </FormGroup>
                </>
              </FormGroup>
            )}
            {state.stageRadio === true && (
              <FormGroup>
                {state.entity === 'deal' ? (
                  <SalesBoardSelect
                    type={state.entity}
                    stageId={state.stageId}
                    pipelineId={state.pipelineId}
                    boardId={state.boardId}
                    onChangeStage={onChangeStage}
                    onChangePipeline={onChangePipeline}
                    onChangeBoard={onChangeBoard}
                  />
                ) : state.entity === 'ticket' ? (
                  <TicketsBoardSelect
                    type={state.entity}
                    stageId={state.stageId}
                    pipelineId={state.pipelineId}
                    boardId={state.boardId}
                    onChangeStage={onChangeStage}
                    onChangePipeline={onChangePipeline}
                    onChangeBoard={onChangeBoard}
                  />
                ) : state.entity === 'task' ? (
                  <TasksBoardSelect
                    type={state.entity}
                    stageId={state.stageId}
                    pipelineId={state.pipelineId}
                    boardId={state.boardId}
                    onChangeStage={onChangeStage}
                    onChangePipeline={onChangePipeline}
                    onChangeBoard={onChangeBoard}
                  />
                ) : state.entity === 'purchase' ? (
                  <PurchasesBoardSelect
                    type={state.entity}
                    stageId={state.stageId}
                    pipelineId={state.pipelineId}
                    boardId={state.boardId}
                    onChangeStage={onChangeStage}
                    onChangePipeline={onChangePipeline}
                    onChangeBoard={onChangeBoard}
                  />
                ) : null}
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
                componentclass="select"
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
                componentclass="select"
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
                  customOption={{ label: __('Choose user'), value: '' }}
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
                  componentclass="select"
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
            {state.teamGoalType === 'Companies' &&
              state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Companies')}</ControlLabel>
                  <SelectCompanies
                    label={__('Choose an Companies')}
                    name="parentCompanyId"
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
                componentclass="select"
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
              <>
                <FormGroup>
                  <ControlLabel>{__('Tags')}</ControlLabel>

                  {state.entity === 'deal' ? (
                    <SelectTags
                      tagsType={`${'sale'}s:${state.entity}`} // Correct template literal usage
                      label={__('Choose Tags')}
                      name="tagsIds"
                      initialValue={goalType?.tagsIds || state.tagsIds}
                      onSelect={onChangeTags}
                      multi={true}
                    />
                  ) : (
                    <SelectTags
                      tagsType={`${state.entity}s:${state.entity}`} // Correct template literal usage
                      label={__('Choose Tags')}
                      name="tagsIds"
                      initialValue={goalType?.tagsIds || state.tagsIds}
                      onSelect={onChangeTags}
                      multi={true}
                    />
                  )}
                </FormGroup>
              </>
            </FormGroup>
            <FormGroup>
              <FormGroup>
                <>
                  <FormGroup>
                    <ControlLabel>{__('Product')}</ControlLabel>
                    <SelectProducts
                      label={__('Choose products')}
                      name="productIds"
                      multi={true}
                      initialValue={goalType?.productIds || state.productIds}
                      onSelect={(productIds) => onChangeProduct(productIds)}
                    />
                  </FormGroup>
                </>
              </FormGroup>
            </FormGroup>
            <FormGroup>
              <ControlLabel>{__('choose specific period goals')}.</ControlLabel>
              <FormControl
                {...formProps}
                name="periodGoal"
                componentclass="select"
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
    'December',
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
