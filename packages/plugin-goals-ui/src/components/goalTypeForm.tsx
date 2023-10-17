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
import { IGoalType, IGoalTypeDoc } from '../types';
import { ENTITY, CONTRIBUTION, FREQUENCY, GOAL_TYPE } from '../constants';
import React from 'react';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import dayjs from 'dayjs';
// import { IBoard, IPipeline, IStage } from '../types';
import { SidebarFilters, FlexRow } from '../styles';
import Select from 'react-select-plus';
import { selectOptions } from '../utils';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
const { Section } = Wrapper.Sidebar;
import SelectBoards from '@erxes/ui-forms/src/settings/properties/containers/SelectBoardPipeline';
import { IBoard, IPipeline } from '@erxes/ui-cards/src/boards/types';
import { IOption } from '@erxes/ui/src/types';
import Icon from '@erxes/ui/src/components/Icon';
import { LinkButton } from '@erxes/ui/src/styles/main';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { Alert } from '@erxes/ui/src/utils';
import { IPipelineLabel } from '@erxes/ui-cards/src/boards/types';
import { queries as pipelineQuery } from '@erxes/ui-cards/src/boards/graphql';
import { IAction } from '@erxes/ui-automations/src/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalType: IGoalType;
  closeModal: () => void;
  selectedMembers: string[];

  selectedItems: any[];
  boards: IBoard[];
  onChangeItems: (items: any[]) => any;
  pipelineLabels?: IPipelineLabel[];
  activeAction: IAction;
};

type State = {
  entity: string;
  contributionType: string;
  frequency: string;
  goalType: string;
  metric: string;
  startDate: Date;
  endDate: Date;
  period: boolean;
  selectedMembers: string[];

  pipelineLabels: IPipelineLabel[];
  config: any;
  stageId?: any;
  pipelineId?: any;
  boardId: any;
};

class GoalTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { goalType = {} } = props;
    const { config = {} } = props;

    this.state = {
      config: config.config,
      pipelineLabels: goalType.pipelineLabels,
      selectedMembers: props.selectedMembers || [],
      entity: goalType.entity || '',
      contributionType: goalType.contributionType || '',
      frequency: goalType.frequency || '',
      goalType: goalType.goalType || '',
      metric: goalType.metric || '',
      period: goalType.period,
      startDate: goalType.startDate || new Date(),
      endDate: goalType.endDate || new Date(),
      stageId: goalType.stageId || '',
      pipelineId: goalType.pipelineId || '',
      boardId: goalType.boardId || ''
      // selectItems
    };
  }

  onChangeFieldBoard = (name: string, value: string) => {
    const { config } = this.state;
    config[name] = value;

    this.setState({ config });
  };

  onChangeStartDate = value => {
    this.setState({ startDate: value });
  };

  // onChangeStage = (stgId) => this.onChangeFieldBoard('stageId', stgId);

  onChangeStage = stgId => {
    this.setState({ stageId: stgId });
  };

  // const stgIdOnChange = (stgId) => this.onChangeField('stageId', stgId);

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
    // this.onChangeFieldBoard('pipelineId', plId);
  };

  // onChangeBoard = (brId) => this.onChangeFieldBoard('boardId', brId);

  onChangeBoard = brId => {
    this.setState({ boardId: brId });
  };

  generateDoc = (values: { _id: string } & IGoalTypeDoc) => {
    const { goalType } = this.props;
    const { startDate, endDate } = this.state;
    const finalValues = values;

    if (goalType) {
      finalValues._id = goalType._id;
    }
    const durationStart = dayjs(startDate).format('MMM D, h:mm A');
    const durationEnd = dayjs(endDate).format('MMM D, h:mm A');

    return {
      // memberIds: this.state.selectedMembers,
      _id: finalValues._id,
      ...this.state,
      entity: finalValues.entity,
      stageId: finalValues.stageId,
      pipelineId: finalValues.pipelineId,
      boardId: finalValues.boardId,
      contributionType: finalValues.contributionType,
      frequency: finalValues.frequency,
      metric: finalValues.metric,
      goalType: finalValues.goalType,
      contribution: this.state.selectedMembers,
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
  renderOptions = option => {
    return (
      <div className="simple-option">
        <span>{option.label}</span>
      </div>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const goalType = this.props.goalType || ({} as IGoalType);
    const { closeModal, renderButton, selectedMembers } = this.props;
    const { values, isSubmitted } = formProps;

    const onChange = items => {
      this.setState({ selectedMembers: items });
    };

    const type = 'deal';

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
                <BoardSelect
                  type={this.state.entity}
                  stageId={this.state.stageId}
                  pipelineId={this.state.pipelineId}
                  boardId={this.state.boardId}
                  onChangeStage={this.onChangeStage}
                  onChangePipeline={this.onChangePipeline}
                  onChangeBoard={this.onChangeBoard}
                />
              </FormGroup>

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
                <ControlLabel>contribution</ControlLabel>
                <SelectTeamMembers
                  label="Choose members"
                  name="selectedMembers"
                  initialValue={selectedMembers}
                  onSelect={onChange}
                />
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
