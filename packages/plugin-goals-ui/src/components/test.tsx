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
import { TabTitle, Tabs as MainTabs, Table } from '@erxes/ui/src';
import { Header } from '@erxes/ui-settings/src/styles';
import SelectSegments from '@erxes/ui-segments/src/containers/SelectSegments';
import { LinkButton } from '@erxes/ui/src/styles/main';
import Icon from '@erxes/ui/src/components/Icon';
import styled from 'styled-components';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalType: IGoalType;
  closeModal: () => void;
  pipelineLabels?: IPipelineLabel[];
  assignmentCampaign?: IAssignmentCampaign;
  stages: any;
  onChangeStages: (stages: any[]) => void;
  type?: string;
};

type State = {
  elements: Array<{
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
  inputValues: {
    monthlyAdd: Date;
    targetAdd: string;
  };
  selectItems: any[];
  // elements: JSX.Element[];
  startDateAdd: Date;
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
class GoalTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { goalType = {} } = props;
    this.state = {
      inputValues: {
        monthlyAdd: new Date(),
        targetAdd: ''
      },
      elements: [{ addMonthly: new Date(), _id: '', addTarget: '' }],
      startDateAdd: new Date(),
      selectItems: goalType.selectItems,
      stageRadio: goalType.stageRadio,
      segmentRadio: goalType.segmentRadio,
      contribution: goalType.contribution,
      pipelineLabels: goalType.pipelineLabels,
      entity: goalType.entity || '',
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

  add = () => {
    const { inputValues, elements } = this.state;
    const newElement = {
      _id: Math.random().toString(),
      addMonthly: new Date(inputValues.monthlyAdd),
      addTarget: inputValues.targetAdd
    };

    this.setState(prevState => ({
      ...prevState,
      elements: [...prevState.elements, newElement]
    }));
  };

  onChangeStartDate = value => {
    this.setState({ startDate: value });
  };
  onChangeStartDateAdd = (index, value) => {
    const { elements } = this.state;
    const updatedElements = elements.map((element, i) => {
      if (i === index) {
        return {
          ...element,
          addMonthly: value
        };
      }
      return element;
    });

    this.setState({
      elements: updatedElements
    });
  };
  onChangeTarget = (index, event) => {
    const { elements } = this.state;
    const { value } = event.target;

    const updatedElements = elements.map((element, i) => {
      if (i === index) {
        return {
          ...element,
          addTarget: value
        };
      }
      return element;
    });

    this.setState({
      elements: updatedElements
    });
  };

  onDeleteElement = index => {
    const { elements } = this.state;
    const updatedElements = [
      ...elements.slice(0, index),
      ...elements.slice(index + 1)
    ];

    this.setState({
      elements: updatedElements
    });
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
      segmentRadio
    } = this.state;
    const finalValues = values;
    const { assignmentCampaign } = this.state;
    if (goalType) {
      finalValues._id = goalType._id;
    }
    const specificPeriodGoalsValue = this.state.elements;
    // console.log(
    //   JSON.stringify(specificPeriodGoalsValue, null, 2),
    //   'specificPeriodGoals'
    // );

    const durationStart = dayjs(startDate).format('MMM D, h:mm A');
    const durationEnd = dayjs(endDate).format('MMM D, h:mm A');
    return {
      _id: finalValues._id,
      ...this.state,
      entity: finalValues.entity,
      specificPeriodGoals: specificPeriodGoalsValue,
      stageRadio,
      segmentRadio,
      stageId,
      pipelineId,
      boardId,
      contribution,
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

  renderNext = () => {
    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <ControlLabel required={true}>{__('choose Entity')}</ControlLabel>
          </FormWrapper>
        </ScrollWrapper>
      </>
    );
  };

  renderButton = () => {
    return <Form renderContent={this.renderContent} />;
  };

  renderContent = (formProps: IFormProps) => {
    const goalType = this.props.goalType || ({} as IGoalType);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const { contribution } = this.state;
    // const { period, elements, startDateAdd } = this.state;
    const { elements } = this.state;

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
                  {['Value (MNT)', 'Count'].map((typeName, index) => (
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
              {elements.map((element, index) => (
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

          {/* {this.state.period === true && (
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>{__('Period (Monthly)')}</ControlLabel>
                  <DateContainer>
                    <DateControl
                      {...formProps}
                      required={false}
                      name='date'
                      value={this.state.startDate}
                      onChange={this.onChangeStartDate}
                    />
                  </DateContainer>
                </FormGroup>
                <LinkButton onClick={this.add}>
                  <Icon icon='plus-1' /> {__('Add another goal')}
                </LinkButton>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  {this.renderFormGroup('target', {
                    ...formProps,
                    name: 'target',
                    type: 'number',
                    defaultValue: goalType.target || 0
                  })}
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          )} */}
        </ScrollWrapper>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>
          <Button onClick={this.renderNext} icon="rightarrow">
            {__('Next')}
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

  // render() {
  //   return (
  //     <Tabs
  //       tabs={[
  //         {
  //           label: 'New Goal',
  //           component: <Form renderContent={this.renderContent} />
  //         },
  //         {
  //           label: 'Next',
  //           component: <Form renderContent={this.renderNext} />
  //         }
  //       ]}
  //     />
  //   );
  // }
}

export default GoalTypeForm;
