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
import {
  IButtonMutateProps,
  IFormProps,
  IRouterProps
} from '@erxes/ui/src/types';
import moment from 'moment';
import React from 'react';
import Select from 'react-select-plus';
import { FormContainer, PlanCard, PlanContainer } from '../../styles';
import { CARDTYPES, STRUCTURETYPES } from '../common/constants';
import ScheduleForm from './PlanForm';

type Props = {
  detail: any;
  renderButton: (variables: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  removeSchedule: (_id: string) => void;
  refetch: (variables?: any) => Promise<any>;
} & IRouterProps;

type State = {
  plan: { param: any[] } & any;
  useGroup: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      plan: props?.detail || {},
      useGroup: false
    };

    this.renderContent = this.renderContent.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      JSON.stringify(prevProps.detail) !== JSON.stringify(this.props.detail)
    ) {
      this.setState({ plan: this.props.detail });
    }
  }

  onChange = (value, name) => {
    const { plan } = this.state;
    plan[name] = value;

    this.setState({ plan });
  };

  generateDoc() {
    return this.state.plan;
  }

  renderScheduleConfig(schedule) {
    const { history, detail, refetch, removeSchedule } = this.props;
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
      removeSchedule(schedule._id);
    };

    const content = ({ closeModal }) => {
      const updatedProps = {
        history,
        refetch,
        planId: detail._id,
        plan: this.state.plan,
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
            {schedule?.date ? moment(schedule?.date).format('L') : '-'}
          </div>
        </div>
        <Button btnStyle="link" onClick={handleRemomve}>
          <Icon icon="times-circle" style={{ color: 'red' }} />
        </Button>
      </PlanCard>
    );

    return (
      <ModalTrigger
        key={schedule._id}
        size="lg"
        title={`Edit Plan`}
        content={content}
        trigger={trigger}
      />
    );
  }

  renderGeneralConfig() {
    const { plan } = this.state;
    const { structureType, configs } = plan;

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
        {structureType && (
          <>
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
    const { detail, history, refetch } = this.props;

    if (!configs?.pipelineId) {
      return null;
    }
    const trigger = <Button btnStyle="success">{__('Add')}</Button>;

    const content = ({ closeModal }) => {
      const updatedProps = {
        history,
        refetch,
        planId: detail?._id,
        plan: this.state.plan,
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
      <ModalTrigger
        title="Add Schedule"
        size="lg"
        content={content}
        trigger={trigger}
      />
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
            {this.renderGeneralConfig()}
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
