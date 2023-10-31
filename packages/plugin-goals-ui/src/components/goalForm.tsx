import {
  Button,
  ControlLabel,
  Form,
  DateControl,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { IGoalType, IGoalTypeDoc, IAssignmentCampaign } from '../types';
import {
  ENTITY,
  CONTRIBUTION,
  GOAL_TYPE,
  SPECIFIC_PERIOD_GOAL,
  GOAL_STRUCTURE
} from '../constants';

import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import client from '@erxes/ui/src/apolloClient';
import { Alert } from '@erxes/ui/src/utils';
import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import React, { useEffect, useState } from 'react';
import { gql } from '@apollo/client';

import {
  BranchesMainQueryResponse,
  DepartmentsMainQueryResponse,
  UnitsMainQueryResponse
} from '@erxes/ui/src/team/types';
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalType: IGoalType;
  closeModal: () => void;
  pipelineLabels?: IPipelineLabel[];
  assignmentCampaign?: IAssignmentCampaign;
  branchListQuery: BranchesMainQueryResponse;
  unitListQuery: UnitsMainQueryResponse;
  departmentListQuery: DepartmentsMainQueryResponse;
};

type State = {
  specificPeriodGoals: Array<{
    _id: string;
    addMonthly: string;
    addTarget: number;
  }>;
  periodGoal: string;
  entity: string;
  teamGoalType: string;
  contributionType: string;
  frequency: string;
  goalType: string;
  metric: string;
  startDate: Date;
  endDate: Date;
  period: boolean;
  contribution: string;
  branch: string;
  department: string;
  unit: string;
  pipelineLabels: IPipelineLabel[];
  stageId?: any;
  pipelineId?: any;
  boardId: any;
  assignmentCampaign: IAssignmentCampaign;
  stageRadio: boolean;
  segmentRadio: boolean;
};

class GoalTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { goalType = {} } = props;
    this.state = {
      branch: goalType.branch || '',
      department: goalType.department || '',
      unit: goalType.unit || '',
      specificPeriodGoals: goalType.specificPeriodGoals || [],
      stageRadio: goalType.stageRadio,
      periodGoal: goalType.periodGoal,
      segmentRadio: goalType.segmentRadio,
      contribution: goalType.contribution,
      pipelineLabels: goalType.pipelineLabels,
      entity: goalType.entity || '',
      teamGoalType: goalType.teamGoalType || '',
      contributionType: goalType.contributionType || '',
      frequency: goalType.frequency || '',
      goalType: goalType.goalType || '',
      metric: goalType.metric || '',
      period: goalType.period,
      startDate: goalType.startDate || new Date(),
      endDate: goalType.endDate || new Date(),
      stageId: goalType.stageId,
      pipelineId: goalType.pipelineId,
      boardId: goalType.boardId,
      assignmentCampaign: this.props.assignmentCampaign || {}
    };
  }

  onChangeStartDate = value => {
    this.setState({ startDate: value });
  };
  onChangeStartDateAdd = (index, value) => {
    const specificPeriodGoals = [...this.state.specificPeriodGoals];
    specificPeriodGoals[index] = {
      ...specificPeriodGoals[index],
      addMonthly: value
    };
    this.setState({ specificPeriodGoals });
  };

  onChangeTarget = (index, event) => {
    const { specificPeriodGoals, periodGoal } = this.state;
    const { value } = event.target;

    const updatedSpecificPeriodGoals = specificPeriodGoals.map((goal, i) => {
      if (i === index) {
        return { ...goal, addTarget: value };
      }
      return goal;
    });
    if (periodGoal === 'Monthly') {
      const months = this.mapMonths();

      months.forEach(month => {
        const exists = specificPeriodGoals.some(
          goal => goal.addMonthly === month
        );
        if (!exists) {
          const newElement = {
            _id: Math.random().toString(),
            addMonthly: month,
            addTarget: 0
          };
          updatedSpecificPeriodGoals.push(newElement);
        }
      });

      this.setState({ specificPeriodGoals: updatedSpecificPeriodGoals });
    } else {
      const weeks = this.mapWeeks();

      weeks.forEach(week => {
        const exists = specificPeriodGoals.some(
          goal => goal.addMonthly === week
        );
        if (!exists) {
          const newElement = {
            _id: Math.random().toString(),
            addMonthly: week,
            addTarget: 0
          };
          updatedSpecificPeriodGoals.push(newElement);
        }
      });

      this.setState({ specificPeriodGoals: updatedSpecificPeriodGoals });
    }
  };

  onDeleteElement = index => {
    const specificPeriodGoals = [...this.state.specificPeriodGoals];
    specificPeriodGoals.splice(index, 1);
    this.setState({ specificPeriodGoals });
  };

  onChangeStage = stgId => {
    this.setState({ stageId: stgId });
  };

  onChangePipeline = plId => {
    client
      .query({
        query: gql(pipelineQuery.pipelineLabels),
        fetchPolicy: 'network-only',
        variables: { pipelineId: plId }
      })
      .then(data => {
        this.setState({ pipelineLabels: data.data.pipelineLabels });
      })
      .catch(e => {
        Alert.error(e.message);
      });

    this.setState({ pipelineId: plId });
  };

  onChangeBoard = brId => {
    this.setState({ boardId: brId });
  };

  /**
   * Generates a document object based on the provided values and state.
   * @param values An object containing the values to be included in the document.
   * @returns An object representing the generated document.
   */
  generateDoc = (values: { _id: string } & IGoalTypeDoc) => {
    const { goalType } = this.props;
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
      specificPeriodGoals
    } = this.state;
    const finalValues = values;
    //// assignmentCampaign segment
    const { assignmentCampaign } = this.state;
    if (goalType) {
      finalValues._id = goalType._id;
    }
    const durationStart = dayjs(startDate).format('MMM D, h:mm A');
    const durationEnd = dayjs(endDate).format('MMM D, h:mm A');
    return {
      _id: finalValues._id,
      ...this.state,
      entity: finalValues.entity,
      department: finalValues.department,
      unit: finalValues.unit,
      branch: finalValues.branch,
      specificPeriodGoals, // Renamed the property
      stageRadio,
      segmentRadio,
      stageId,
      pipelineId,
      boardId,
      contribution,
      period,
      contributionType: finalValues.contributionType,
      frequency: finalValues.frequency,
      metric: finalValues.metric,
      goalType: finalValues.goalType,
      startDate: durationStart,
      endDate: durationEnd,
      target: finalValues.target
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };
  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : (e.target as HTMLInputElement).value;

    this.setState({ [name]: value } as any);
  };

  onChangeEndDate = value => {
    this.setState({ endDate: value });
  };
  onUserChange = userId => {
    this.setState({ contribution: userId });
  };

  onChangeSegments = values => {
    this.setState({
      assignmentCampaign: {
        ...this.state.assignmentCampaign,
        segmentIds: values.map(v => v.value)
      }
    });
  };

  renderButton = () => {
    return <Form renderContent={this.renderContent} />;
  };

  mapMonths = (): string[] => {
    const { startDate, endDate } = this.state;
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
      'December'
    ];
    const months: string[] = [];

    for (let i = startMonth; i <= endMonth; i++) {
      months.push(`${monthNames[i]} ${year}`);
    }
    return months;
  };

  mapWeeks = (): string[] => {
    const { startDate, endDate } = this.state;
    const weeks: string[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push(
        `Week of ${weekStart.toDateString()} - ${weekEnd.toDateString()}`
      );
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return weeks;
  };
  renderContent = (formProps: IFormProps) => {
    const goalType = this.props.goalType || ({} as IGoalType);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const months: string[] = this.mapMonths();

    const weeks = this.mapWeeks();
    const { departmentListQuery, branchListQuery, unitListQuery } = this.props;
    const departments = departmentListQuery.departmentsMain?.list || [];
    const branches = branchListQuery.branchesMain?.list || [];
    const units = unitListQuery.unitsMain?.list || [];
    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('choose Entity')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="entity"
                  componentClass="select"
                  value={this.state.entity}
                  required={true}
                  onChange={this.onChangeField}
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
                  checked={this.state.stageRadio}
                  onChange={this.onChangeField}
                  inline={true}
                >
                  {__('Stage')}
                </FormControl>
                <FormControl
                  {...formProps}
                  componentClass="checkbox" // Use 'input' for checkboxes
                  name="segmentRadio"
                  checked={this.state.segmentRadio}
                  onChange={this.onChangeField}
                  inline={true}
                />
                {__('Segment')}
              </FormGroup>

              {this.state.segmentRadio === true && (
                <FormGroup>
                  {isEnabled('segments') && (
                    <>
                      <ControlLabel>{__('Segment')}</ControlLabel>
                      <SelectSegments
                        name="segmentIds"
                        label="Choose segments"
                        contentTypes={['contacts:customer', 'contacts:lead']}
                        initialValue={this.state.assignmentCampaign.segmentIds}
                        multi={true}
                        onSelect={segmentIds =>
                          this.onChangeSegments(segmentIds)
                        }
                      />
                    </>
                  )}
                </FormGroup>
              )}
              {this.state.stageRadio === true && (
                <FormGroup>
                  {isEnabled('cards') && (
                    <BoardSelect
                      type={this.state.entity}
                      stageId={this.state.stageId}
                      pipelineId={this.state.pipelineId}
                      boardId={this.state.boardId}
                      onChangeStage={this.onChangeStage}
                      onChangePipeline={this.onChangePipeline}
                      onChangeBoard={this.onChangeBoard}
                    />
                  )}
                </FormGroup>
              )}

              {/* <FormGroup> next development
                <ControlLabel required={true}>{__('frequency')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name='frequency'
                  componentClass='select'
                  value={this.state.frequency}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {FREQUENCY.map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup> */}
              <FormGroup>
                <ControlLabel>{__('start duration')}:</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="date"
                    value={this.state.startDate}
                    onChange={this.onChangeStartDate}
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
                    value={this.state.endDate}
                    onChange={this.onChangeEndDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('choose goalType type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="goalType"
                  componentClass="select"
                  value={this.state.goalType}
                  onChange={this.onChangeField}
                >
                  {GOAL_TYPE.map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('contribution type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="contributionType"
                  componentClass="select"
                  value={this.state.contributionType}
                  onChange={this.onChangeField}
                >
                  {CONTRIBUTION.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {this.state.contributionType === 'person' && (
                <FormGroup>
                  <ControlLabel>contribution</ControlLabel>
                  <SelectTeamMembers
                    label="Choose users"
                    name="userId"
                    customOption={{ label: 'Choose user', value: '' }}
                    initialValue={this.state.contribution || ''}
                    onSelect={this.onUserChange}
                    multi={false}
                  />
                </FormGroup>
              )}
              {this.state.contributionType === 'team' && (
                <FormGroup>
                  <ControlLabel>{__('Choose Structure')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="teamGoalType"
                    componentClass="select"
                    value={this.state.teamGoalType}
                    onChange={this.onChangeField}
                  >
                    {GOAL_STRUCTURE.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.name}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              )}
              {this.state.teamGoalType === 'Departments' &&
                this.state.contributionType === 'team' && (
                  <FormGroup>
                    <ControlLabel>{__('Departments')}</ControlLabel>
                    <FormControl
                      {...formProps}
                      name="department"
                      componentClass="select"
                      value={this.state.department}
                      onChange={this.onChangeField}
                    >
                      {departments.map((item, index) => (
                        <option key={index} value={item._id}>
                          {item.title}
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>
                )}
              {this.state.teamGoalType === 'Units' &&
                this.state.contributionType === 'team' && (
                  <FormGroup>
                    <ControlLabel>{__('Units')}</ControlLabel>
                    <FormControl
                      {...formProps}
                      name="unit"
                      componentClass="select"
                      value={this.state.unit}
                      onChange={this.onChangeField}
                    >
                      {units.map((item, index) => (
                        <option key={index} value={item._id}>
                          {item.title}
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>
                )}
              {this.state.teamGoalType === 'Branches' &&
                this.state.contributionType === 'team' && (
                  <FormGroup>
                    <ControlLabel>{__('Branches')}</ControlLabel>
                    <FormControl
                      {...formProps}
                      name="branch"
                      componentClass="select"
                      value={this.state.branch}
                      onChange={this.onChangeField}
                    >
                      {branches.map((item, index) => (
                        <option key={index} value={item._id}>
                          {item.title}
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>
                )}

              <FormGroup>
                <ControlLabel>{__('metric')}:</ControlLabel>
                <FormControl
                  {...formProps}
                  name="metric"
                  componentClass="select"
                  value={this.state.metric}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['Value', 'Count'].map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup>
                {this.renderFormGroup('target', {
                  ...formProps,
                  name: 'target',
                  type: 'number',
                  defaultValue: goalType.target || 0
                })}
              </FormGroup>
              <FormGroup>
                <ControlLabel>
                  {__('choose specific period goals')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="periodGoal"
                  componentClass="select"
                  value={this.state.periodGoal}
                  required={true}
                  onChange={this.onChangeField}
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
          {this.state.periodGoal === 'Monthly' && (
            <div>
              {months.map((month, index) => (
                <FormWrapper key={index}>
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
                          this.state.specificPeriodGoals[index]?.addTarget !==
                          undefined
                            ? this.state.specificPeriodGoals[index].addTarget
                            : 0
                        }
                        onChange={event => this.onChangeTarget(index, event)}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              ))}
            </div>
          )}
          {this.state.periodGoal === 'Weekly' && (
            <div>
              {weeks.map((week, index) => (
                <FormWrapper key={index}>
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
                          this.state.specificPeriodGoals[index]?.addTarget !==
                          undefined
                            ? this.state.specificPeriodGoals[index].addTarget
                            : 0
                        }
                        onChange={event => this.onChangeTarget(index, event)}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              ))}
            </div>
          )}
        </ScrollWrapper>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>
          {renderButton({
            name: 'goalType',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.goalType
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default GoalTypeForm;
