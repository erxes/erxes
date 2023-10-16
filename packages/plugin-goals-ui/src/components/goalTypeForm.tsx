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
import { IGoalType, IGoalTypeDoc } from '../types';
import { ENTITY, CONTRIBUTION, FREQUENCY, GOAL_TYPE } from '../constants';
import React from 'react';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import dayjs from 'dayjs';
import { IBoard, IPipeline, IStage } from '../types';
import { SidebarFilters } from '../styles';
import Select from 'react-select-plus';
import { selectOptions } from '../utils';
import { Sidebar, Wrapper } from '@erxes/ui/src/layout';
const { Section } = Wrapper.Sidebar;
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  goalType: IGoalType;
  closeModal: () => void;
  selectedMembers: string[];
  boards: IBoard[];
  pipelines: IPipeline[];
  stages: IStage[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  onChangeBoard: (value: string) => void;
  onChangePipeline: (value: string) => void;
  onChangeStage: (value: string, callback?: () => void) => void;
  callback?: () => void;
  translator?: (key: string, options?: any) => string;
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
};

class GoalTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { goalType = {} } = props;

    this.state = {
      selectedMembers: props.selectedMembers || [],
      entity: goalType.entity || '',
      contributionType: goalType.contributionType || '',
      frequency: goalType.frequency || '',
      goalType: goalType.goalType || '',
      metric: goalType.metric || '',
      period: goalType.period,
      startDate: goalType.startDate || new Date(),
      endDate: goalType.endDate || new Date()
    };
  }

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
      memberIds: this.state.selectedMembers,
      _id: finalValues._id,
      ...this.state,
      entity: finalValues.entity,
      contributionType: finalValues.contributionType,
      // chooseBoard: finalValues.chooseBoard,
      frequency: finalValues.frequency,
      metric: finalValues.metric,
      goalType: finalValues.goalType,
      // contribution: finalValues.contribution,
      startDate: durationStart,
      endDate: durationEnd,
      // target: finalValues.target
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

  onChangeStartDate = value => {
    this.setState({ startDate: value });
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
  renderSelect(placeholder, value, onChange, options) {
    return (
      <Select
        isRequired={true}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        optionRenderer={this.renderOptions}
        options={options}
        clearable={false}
      />
    );
  }
  renderContent = (formProps: IFormProps) => {
    const goalType = this.props.goalType || ({} as IGoalType);
    const { closeModal, renderButton, selectedMembers } = this.props;
    const { values, isSubmitted } = formProps;
    console.log(selectedMembers, 'selectedMembers');
    const {
      boards,
      pipelines,
      stages,
      boardId,
      pipelineId,
      stageId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage,
      callback
    } = this.props;
    const __ = (key: string, options?: any) => {
      const { translator } = this.props;
      if (!translator) {
        return key;
      }
      return translator(key, options);
    };
    const onChange = items => {
      this.setState({ selectedMembers: items });
    };

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
                  {ENTITY.map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Board</ControlLabel>
                {this.renderSelect(
                  __('Choose a board'),
                  boardId,
                  board => onChangeBoard(board.value),
                  selectOptions(boards)
                )}
              </FormGroup>

              <FormGroup>
                <ControlLabel>Pipeline</ControlLabel>
                {this.renderSelect(
                  __('Choose a pipeline'),
                  pipelineId,
                  pipeline => onChangePipeline(pipeline.value),
                  selectOptions(pipelines)
                )}
              </FormGroup>

              <FormGroup>
                <ControlLabel>Stage</ControlLabel>
                {this.renderSelect(
                  __('Choose a stage'),

                  stageId,
                  stage => onChangeStage(stage.value, callback),
                  selectOptions(stages)
                )}
              </FormGroup>

              {/* {this.renderFormGroup('choose board,pipeline', {
                ...formProps,
                name: 'chooseBoard',
                defaultValue: goalType.chooseBoard || ''
              })} */}
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
                    // value={this.state.startDate}
                    // onChange={this.onChangeField}
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

              {/* {this.renderFormGroup('contribution', {
                ...formProps,
                name: 'contribution',
                defaultValue: goalType.contribution || ''
              })} */}
              {/* {this.renderFormGroup('choose stage', {
                ...formProps,
                name: 'chooseStage',
                defaultValue: goalType.chooseStage || ''
              })} */}
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
