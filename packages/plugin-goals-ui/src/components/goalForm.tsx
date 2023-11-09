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
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import {
  BranchesMainQueryResponse,
  DepartmentsMainQueryResponse,
  UnitsMainQueryResponse
} from '@erxes/ui/src/team/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { Alert } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { __ } from 'coreui/utils';
import React from 'react';
import {
  CONTRIBUTION,
  ENTITY,
  GOAL_STRUCTURE,
  GOAL_TYPE,
  SPECIFIC_PERIOD_GOAL
} from '../constants';
import { IGoalType, IGoalTypeDoc } from '../types';
import { Description } from '@erxes/ui-settings/src/styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalType: IGoalType;
  closeModal: () => void;
  pipelineLabels?: IPipelineLabel[];
  segmentIds: string[];
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
  metric: string;
  target: string;
  goalTypeChoose: string;
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
  segmentIds: any;
  stageRadio: boolean;
  segmentRadio: boolean;
  notificationButton: boolean;
  notification: {
    goalStarted: boolean;
    goalAchieved: boolean;
    goalMissed: boolean;
  };
};

class GoalTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { goalType = {} } = props;
    this.state = {
      notification: {
        goalStarted: false,
        goalAchieved: false,
        goalMissed: false
      },
      notificationButton: goalType.notificationButton,
      segmentIds: goalType.segmentIds,
      branch: goalType.branch,
      department: goalType.department,
      unit: goalType.unit,
      specificPeriodGoals: goalType.specificPeriodGoals || [],
      stageRadio: goalType.stageRadio,
      periodGoal: goalType.periodGoal,
      segmentRadio: goalType.segmentRadio,
      contribution: goalType.contribution,
      pipelineLabels: goalType.pipelineLabels,
      entity: goalType.entity || ENTITY[0].value,
      teamGoalType: goalType.teamGoalType,
      contributionType: goalType.contributionType || CONTRIBUTION[0].value,
      goalTypeChoose: goalType.goalTypeChoose || GOAL_TYPE[0],
      metric: goalType.metric || 'Value',
      period: goalType.period,
      startDate: goalType.startDate || new Date(),
      endDate: goalType.endDate || new Date(),
      stageId: goalType.stageId,
      pipelineId: goalType.pipelineId,
      boardId: goalType.boardId,
      target: goalType.target
    };
  }

  onChangeStartDate = value => {
    this.setState({ startDate: value });
  };

  onChangeTargetPeriod = event => {
    const { value } = event.target;
    this.setState({ target: value });
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

    const periods =
      periodGoal === 'Monthly' ? this.mapMonths() : this.mapWeeks();

    periods.forEach(period => {
      const exists = specificPeriodGoals.some(
        goal => goal.addMonthly === period
      );
      if (!exists) {
        const newElement = {
          _id: Math.random().toString(),
          addMonthly: period,
          addTarget: 0
        };
        updatedSpecificPeriodGoals.push(newElement);
      }
    });

    this.setState({ specificPeriodGoals: updatedSpecificPeriodGoals });
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
      specificPeriodGoals,
      segmentIds,
      notification,
      entity,
      department,
      unit,
      branch,
      contributionType,
      metric,
      target,
      goalTypeChoose
    } = this.state;
    const finalValues = values;
    if (goalType) {
      finalValues._id = goalType._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
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
      startDate,
      endDate,
      target,
      notification
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

  onChangeFieldNotification = event => {
    const { name, checked } = event.target;
    this.setState(prevState => ({
      notification: {
        ...prevState.notification,
        [name]: checked
      }
    }));
  };

  onChangeEndDate = value => {
    this.setState({ endDate: value });
  };
  onUserChange = userId => {
    this.setState({ contribution: userId });
  };
  onChangeSegments = values => {
    this.setState({ segmentIds: values });
  };

  mapMonths = (): string[] => {
    const { startDate, endDate } = this.state;
    const startDateObject = new Date(startDate); // Ensure startDate is a
    const endDateObject = new Date(endDate); // Ensure endDate is a Date
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
        {(!this.state.notificationButton ||
          this.state.notificationButton === undefined) && (
          <>
            <ScrollWrapper>
              <FormWrapper>
                <FormColumn>
                  <FormGroup>
                    <ControlLabel>{__('choose Entity')}</ControlLabel>
                    <FormControl
                      {...formProps}
                      name="entity"
                      componentClass="select"
                      value={this.state.entity}
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
                      {isEnabled('segments') && isEnabled('contacts') && (
                        <>
                          <FormGroup>
                            <ControlLabel>Segments</ControlLabel>
                            <SelectSegments
                              name="segmentIds"
                              label="Choose segments"
                              contentTypes={[`cards:${this.state.entity}`]}
                              initialValue={this.state.segmentIds.segmentIds}
                              multi={true}
                              onSelect={segmentIds =>
                                this.onChangeSegments(segmentIds)
                              }
                            />
                          </FormGroup>
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
                    <ControlLabel>{__('choose goalType type')}</ControlLabel>
                    <FormControl
                      {...formProps}
                      name="goalTypeChoose"
                      componentClass="select"
                      value={this.state.goalTypeChoose}
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
                    <ControlLabel>{__('contribution type')}</ControlLabel>
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
                    <ControlLabel>{__('Target')}</ControlLabel>
                    <FormGroup>
                      <FormControl
                        type="number"
                        name="target"
                        value={
                          this.state.target !== undefined &&
                          this.state.target !== null
                            ? this.state.target
                            : 0
                        }
                        onChange={this.onChangeTargetPeriod}
                      />
                    </FormGroup>
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
                              this.state.specificPeriodGoals[index]
                                ?.addTarget !== undefined
                                ? this.state.specificPeriodGoals[index]
                                    .addTarget
                                : 0
                            }
                            onChange={event =>
                              this.onChangeTarget(index, event)
                            }
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
                              this.state.specificPeriodGoals[index]
                                ?.addTarget !== undefined
                                ? this.state.specificPeriodGoals[index]
                                    .addTarget
                                : 0
                            }
                            onChange={event =>
                              this.onChangeTarget(index, event)
                            }
                          />
                        </FormGroup>
                      </FormColumn>
                    </FormWrapper>
                  ))}
                </div>
              )}
            </ScrollWrapper>
          </>
        )}
        {this.state.notificationButton === true && (
          <>
            <FormColumn>
              <h3 style={{ textAlign: 'center' }}>
                {__('Add notifications to your goal')}
              </h3>
              <FormGroup>
                <FormControl
                  componentClass="checkbox" // Use 'input' for checkboxes
                  name="goalStarted"
                  checked={this.state.notification.goalStarted}
                  onChange={this.onChangeFieldNotification}
                  inline={true}
                >
                  <ControlLabel>{__('Goal Started')}:</ControlLabel>
                </FormControl>
                <Description>
                  {__('Receive a notification when the goal has started')}
                </Description>
              </FormGroup>
              <FormGroup>
                <FormControl
                  componentClass="checkbox" // Use 'input' for checkboxes
                  name="goalAchieved"
                  checked={this.state.notification.goalAchieved}
                  onChange={this.onChangeFieldNotification}
                  inline={true}
                >
                  <ControlLabel>{__('Goal Achieved')}:</ControlLabel>
                </FormControl>
                <Description>
                  {__(
                    'Receive a notification when the goal reached 100% of the target within the duration'
                  )}
                </Description>
              </FormGroup>
              <FormGroup>
                <FormControl
                  componentClass="checkbox" // Use 'input' for checkboxes
                  name="goalMissed"
                  checked={this.state.notification.goalMissed}
                  onChange={this.onChangeFieldNotification}
                  inline={true}
                >
                  <ControlLabel>{__('Goal Missed')}:</ControlLabel>
                </FormControl>
                <Description>
                  {__(
                    'Receive a notification when the goal didn’t reach 100% of the target within the duration'
                  )}
                </Description>
              </FormGroup>
            </FormColumn>
          </>
        )}
        <ModalFooter>
          {(!this.state.notificationButton ||
            this.state.notificationButton === undefined) && (
            <div>
              <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
                {__('Close')}
              </Button>
              <Button
                btnStyle="success"
                onClick={() => {
                  this.setState({ notificationButton: true });
                }}
                icon="arrow-right"
              >
                {__('Next')}
              </Button>
            </div>
          )}
          {this.state.notificationButton === true && (
            <div>
              <Button
                btnStyle="danger"
                onClick={() => this.setState({ notificationButton: false })}
                icon="arrow-left"
              >
                {__('Back')}
              </Button>
              {renderButton({
                name: 'goalType',
                values: this.generateDoc(values),
                isSubmitted,
                object: this.props.goalType
              })}
            </div>
          )}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default GoalTypeForm;
