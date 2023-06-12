import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { Indicator } from '@erxes/ui-cards/src/boards/styles/stage';
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  Step,
  Steps,
  __,
  colors
} from '@erxes/ui/src';
import {
  ControlWrapper,
  StepWrapper
} from '@erxes/ui/src/components/step/styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import {
  IButtonMutateProps,
  IFormProps,
  IRouterProps
} from '@erxes/ui/src/types';
import moment from 'moment';
import React from 'react';
import Select from 'react-select-plus';
import { SelectOperations } from '../../common/utils';
import { FormContainer, PlanCard, PlanContainer } from '../../styles';
import { CARDTYPES, STRUCTURETYPES } from '../common/constants';
import ScheduleForm from './PlanForm';

type Props = {
  detail: any;
  renderButton: (variables: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  removeSchedule: (_id: string) => void;
} & IRouterProps;

type State = {
  plan: { param: any[] } & any;
  useGroup: boolean;
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      plan: { ...props?.detail } || {},
      useGroup: false
    };

    this.renderContent = this.renderContent.bind(this);
  }

  onChange = (value, name) => {
    const { plan } = this.state;

    if (name === 'structureType') {
      delete plan?.structureTypeIds;
    }
    plan[name] = value;

    this.setState({ plan });
  };

  generateDoc() {
    return this.state.plan;
  }

  renderSelectStructure() {
    const {
      plan: { structureType, structureTypeIds }
    } = this.state;

    const content = () => {
      switch (structureType) {
        case 'branch':
          return (
            <SelectBranches
              label="Select Branch"
              name="structureTypeIds"
              initialValue={structureTypeIds}
              onSelect={this.onChange}
            />
          );
        case 'department':
          return (
            <SelectDepartments
              label="Select Department"
              name="structureTypeIds"
              initialValue={structureTypeIds}
              onSelect={this.onChange}
            />
          );
        case 'operation':
          return (
            <SelectOperations
              label="Select Operation"
              name="structureTypeIds"
              initialValue={structureTypeIds}
              onSelect={this.onChange}
              multi
            />
          );

        default:
          return null;
      }
    };

    return (
      <FormGroup>
        <ControlLabel>{capitalize(structureType)}</ControlLabel>
        {content()}
      </FormGroup>
    );
  }

  renderScheduleConfig(schedule) {
    const {
      plan: { configs = {}, schedules = [] }
    } = this.state;

    const handleChange = doc => {
      const updatedParams = schedules.map(item =>
        item._id === schedule._id ? { ...item, ...doc } : item
      );

      this.onChange(updatedParams, 'schedules');
    };

    const handleRemomve = e => {
      e.stopPropagation();
      this.props.removeSchedule(schedule._id);
    };

    const content = ({ closeModal }) => {
      const updatedProps = {
        history: this.props.history,
        planId: this.props.detail._id,
        closeModal,
        cardType: configs.cardType,
        pipelineId: configs.pipelineId,
        schedule: schedule,
        onSave: handleChange
      };

      return <ScheduleForm {...updatedProps} />;
    };

    const trigger = (
      <PlanCard key={schedule._id}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Icon
            icon={schedule.status === 'Done' ? 'check-1' : 'loading'}
            size={24}
            color={
              schedule.status === 'Done'
                ? colors.colorCoreGreen
                : colors.colorCoreBlue
            }
          />
          <div>
            <h4>{schedule.name}</h4>
            {schedule?.date ? moment(schedule?.date).format('lll HH:mm') : '-'}
          </div>
        </div>
        <Button
          btnStyle="link"
          style={{ color: 'red' }}
          onClick={handleRemomve}
        >
          <Icon icon="times-circle" />
        </Button>
      </PlanCard>
    );

    return (
      <ModalTrigger
        key={schedule._id}
        title={`Edit Plan`}
        content={content}
        trigger={trigger}
      />
    );
  }

  renderGeneralConfig(formProps: IFormProps) {
    const { plan } = this.state;
    const { configs } = plan;

    const handleChange = (e: React.FormEvent<HTMLElement>) => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      this.onChange(value, name);
    };

    const handleConfigChange = (value, name) => {
      this.setState({
        plan: { ...plan, configs: { ...configs, [name]: value } }
      });
    };

    return (
      <FormContainer padding="15px" column>
        <FormGroup>
          <ControlLabel required>{__('Name')}</ControlLabel>
          <FormControl
            name="name"
            defaultValue={plan?.name}
            placeholder="Type a name"
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Structure Type')}</ControlLabel>
          <Select
            name="structureType"
            placeholder={__('Select structure Type')}
            value={plan?.structureType}
            options={STRUCTURETYPES}
            multi={false}
            onChange={props => this.onChange(props?.value, 'structureType')}
          />
        </FormGroup>
        {plan?.structureType && (
          <>
            {this.renderSelectStructure()}

            <FormGroup>
              <ControlLabel>{__('Card Type')}</ControlLabel>
              <Select
                name="type"
                placeholder={__('Select card type')}
                value={configs?.cardType}
                options={CARDTYPES}
                multi={false}
                onChange={props =>
                  this.onChange(
                    { ...configs, cardType: props?.value },
                    'configs'
                  )
                }
              />
            </FormGroup>
            {configs?.cardType && (
              <BoardSelectContainer
                type={configs?.cardType}
                boardId={configs?.boardId}
                pipelineId={configs?.pipelineId}
                stageId={configs?.stageId}
                onChangeBoard={value => handleConfigChange(value, 'boardId')}
                onChangePipeline={value =>
                  handleConfigChange(value, 'pipelineId')
                }
                onChangeStage={value => handleConfigChange(value, 'stageId')}
                autoSelectStage
              />
            )}
          </>
        )}
      </FormContainer>
    );
  }

  renderSchedulesContent() {
    const { plan } = this.state;
    const { schedules = [] } = plan;

    if (!schedules?.length) {
      return (
        <EmptyState
          text="Please select general configuration before set plan"
          icon="calendar-alt"
          size="lg"
        />
      );
    }

    return (
      <FormContainer row gap padding="25px">
        {schedules.map(schedule => this.renderScheduleConfig(schedule))}
      </FormContainer>
    );
  }

  renderAddPlanForm() {
    const { plan } = this.state;
    const { schedules = [], configs } = plan;

    if (!configs?.pipelineId) {
      return null;
    }
    const trigger = <Button>{__('Add')}</Button>;

    const content = ({ closeModal }) => {
      const updatedProps = {
        history: this.props.history,
        planId: this.props?.detail?._id,
        closeModal,
        cardType: configs?.cardType,
        pipelineId: configs.pipelineId,
        schedule: { _id: Math.random() },
        onSave: doc =>
          this.setState({ plan: { ...plan, schedules: [...schedules, doc] } })
      };

      return <ScheduleForm {...updatedProps} />;
    };

    return (
      <ModalTrigger title="Add Schedule" content={content} trigger={trigger} />
    );
  }

  renderContent(formProps: IFormProps) {
    const { renderButton, detail } = this.props;
    const { plan } = this.state;
    const { configs } = plan;

    const saveSteps = stepNumber => {
      const fieldName = detail ? detail._id : 'create';
      const steps = JSON.parse(
        localStorage.getItem('risk_assessment_plans_active_step') || '{}'
      );

      const updateSteps = { ...steps, [fieldName]: stepNumber };

      localStorage.setItem(
        'risk_assessment_plans_active_step',
        JSON.stringify(updateSteps)
      );
    };

    const activeStep = (): number => {
      const steps = JSON.parse(
        localStorage.getItem('risk_assessment_plans_active_step') || '{}'
      );

      const fieldName = detail ? detail._id : 'create';

      console.log('ds');

      return steps[fieldName] || 0;
    };

    return (
      <StepWrapper>
        <Steps active={activeStep()}>
          <Step
            title="General"
            img="/images/icons/erxes-24.svg"
            noButton
            onClick={saveSteps}
          >
            {this.renderGeneralConfig(formProps)}
          </Step>

          <Step
            title="Schedules"
            img="/images/icons/erxes-21.svg"
            noButton={!configs?.pipelineId}
            additionalButton={this.renderAddPlanForm()}
            onClick={saveSteps}
          >
            {this.renderSchedulesContent()}
          </Step>
        </Steps>
        <ControlWrapper>
          <Indicator>
            {__('You are')} {(detail ? 'editing' : 'creating') + ' plan'}
          </Indicator>
          {renderButton({
            ...formProps,
            text: 'Plan',
            values: this.generateDoc(),
            object: detail
          })}
        </ControlWrapper>
      </StepWrapper>
    );
  }

  render() {
    return (
      <PlanContainer>
        <CommonForm renderContent={this.renderContent} />
      </PlanContainer>
    );
  }
}

export default Form;
