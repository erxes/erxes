import * as path from 'path';

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
import { ENTITY, CONTRIBUTION, FREQUENCY, GOAL_TYPE } from '../constants';
import React from 'react';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import dayjs from 'dayjs';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { Alert } from '@erxes/ui/src/utils';
import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import { isEnabled } from '@erxes/ui/src/utils/core';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import { LinkButton } from '@erxes/ui/src/styles/main';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';
import { TabTitle, Tabs as MainTabs, Table } from '@erxes/ui/src';
import { DatePicker } from '@/components/ui/date-picker';
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goal: IGoalType;
  closeModal: () => void;
  pipelineLabels?: IPipelineLabel[];
  assignmentCampaign?: IAssignmentCampaign;
};

type State = {
  specificPeriodGoals: Array<{
    _id: string;
    addMonthly: Date;
    addTarget: string;
  }>;
  entity: string;
  contributionType: string;
  frequency: string;
  goalType: string;
  metric: string;
  startDate: Date;
  endDate: Date;
  period: boolean;
  contribution: string;
  pipelineLabels: IPipelineLabel[];
  stageId?: any;
  pipelineId?: any;
  boardId: any;
  assignmentCampaign: IAssignmentCampaign;
  stageRadio: boolean;
  segmentRadio: boolean;
};

interface ITabs {
  tabs: ITabItem[];
}
interface ITabItem {
  component: any;
  label: string;
}
const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;
function Tabs({ tabs }: ITabs) {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <>
      <MainTabs grayBorder>
        {tabs.map((tab, index) => (
          <TabTitle
            style={{
              backgroundColor: index === tabIndex && 'rgba(128,128,128,0.2)'
            }}
            key={`tab${tab.label}`}
            onClick={() => setTabIndex(index)}
          >
            {tab.label}
          </TabTitle>
        ))}
      </MainTabs>

      <div style={{ width: '100%', marginTop: 20 }}>
        {tabs?.[tabIndex]?.component}
      </div>
    </>
  );
}

class GoalTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { goal = {} } = props;
    this.state = {
      specificPeriodGoals: goal.specificPeriodGoals || [],
      stageRadio: goal.stageRadio,
      segmentRadio: goal.segmentRadio,
      contribution: goal.contribution,
      pipelineLabels: goal.pipelineLabels,
      entity: goal.entity || '',
      contributionType: goal.contributionType || '',
      frequency: goal.frequency || '',
      goalType: goal.goalType || '',
      metric: goal.metric || '',
      period: goal.period,
      startDate: goal.startDate || new Date(),
      endDate: goal.endDate || new Date(),
      stageId: goal.stageId,
      pipelineId: goal.pipelineId,
      boardId: goal.boardId,
      assignmentCampaign: this.props.assignmentCampaign || {}
    };
  }

  add = () => {
    const { specificPeriodGoals } = this.state;

    // Check if there are elements in specificPeriodGoals before accessing its properties
    const newElement =
      specificPeriodGoals.length > 0
        ? {
            _id: Math.random().toString(), // You should use a more robust method for generating unique IDs
            addMonthly: specificPeriodGoals[0].addMonthly
              ? new Date(specificPeriodGoals[0].addMonthly)
              : new Date(),
            addTarget: specificPeriodGoals[0].addTarget || 'defaultTargetValue'
          }
        : {
            _id: Math.random().toString(), // You should use a more robust method for generating unique IDs
            addMonthly: new Date(),
            addTarget: 'defaultTargetValue'
          };

    this.setState(prevState => ({
      ...prevState,
      specificPeriodGoals: [...prevState.specificPeriodGoals, newElement]
    }));
  };

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
    const specificPeriodGoals = [...this.state.specificPeriodGoals];
    specificPeriodGoals[index] = {
      ...specificPeriodGoals[index],
      addTarget: event.target.value
    };
    this.setState({ specificPeriodGoals });
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
    const { goal } = this.props;
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
    if (goal) {
      finalValues._id = goal._id;
    }
    const durationStart = dayjs(startDate).format('MMM D, h:mm A');
    const durationEnd = dayjs(endDate).format('MMM D, h:mm A');
    return {
      _id: finalValues._id,
      ...this.state,
      entity: finalValues.entity,
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

  renderContent = (formProps: IFormProps) => {
    const goal = this.props.goal || ({} as IGoalType);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const { contribution } = this.state;
    const { specificPeriodGoals } = this.state;
    /// dateContaner only month and year code
    const dateContainer = date => {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${month}/${year}`;
    };
    console.log(this.state.entity, 'this.state.entity');

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

              <FormGroup>
                <ControlLabel required={true}>{__('frequency')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="frequency"
                  componentClass="select"
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
              </FormGroup>
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
                  {__('choose goal type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="goalType"
                  componentClass="select"
                  value={this.state.goalType}
                  required={true}
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
                  required={true}
                  onChange={this.onChangeField}
                >
                  {CONTRIBUTION.map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel>contribution</ControlLabel>
                <SelectTeamMembers
                  label="Choose users"
                  name="userId"
                  customOption={{ label: 'Choose user', value: '' }}
                  initialValue={contribution || ''}
                  onSelect={this.onUserChange}
                  multi={false}
                />
              </FormGroup>
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
                  defaultValue: goal.target || 0
                })}
              </FormGroup>
              <FormGroup>
                {this.renderFormGroup('specific period goals', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'checkbox',
                  componentClass: 'checkbox',
                  name: 'period',
                  checked: this.state.period,
                  onChange: this.onChangeField
                })}
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          {this.state.period === true && (
            <div>
              {this.state.specificPeriodGoals.map((element, index) => (
                <FormWrapper key={index}>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Period (Monthly)')}</ControlLabel>

                      <DateContainer>
                        <DateControl
                          required={false}
                          name="date"
                          value={element.addMonthly}
                          onChange={value =>
                            this.onChangeStartDateAdd(index, value)
                          }
                        />
                      </DateContainer>
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Target(Value, MNT)')}</ControlLabel>
                      <FormControl
                        type="number"
                        name="target"
                        value={element.addTarget || '0'}
                        onChange={event => this.onChangeTarget(index, event)}
                      />
                    </FormGroup>
                  </FormColumn>
                  <Button
                    btnStyle="link"
                    onClick={() => this.onDeleteElement(index)}
                    icon="times"
                  />
                </FormWrapper>
              ))}
              <LinkButton onClick={this.add}>
                <Icon icon="plus-1" /> {__('Add another goal')}
              </LinkButton>
            </div>
          )}
        </ScrollWrapper>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>
          {renderButton({
            name: 'goal',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.goal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <Tabs
        tabs={[
          {
            label: 'GOAL',
            component: <Form renderContent={this.renderContent} />
          },
          {
            label: 'NOTIFICATIONS',
            component: <Form renderContent={this.renderGraphic} />
          }
        ]}
      />
    );
  }
}

export default GoalTypeForm;
