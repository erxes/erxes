import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  Button,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  ModalTrigger,
  Step,
  Steps,
  __
} from '@erxes/ui/src';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import moment from 'moment';
import React from 'react';
import Select from 'react-select-plus';
import { SelectOperations } from '../../common/utils';
import { FormContainer, PlanCard, RemoveRow } from '../../styles';
import { CARDTYPES, STRUCTURETYPES } from '../common/constants';
import PlanForm from './PlanForm';

type Props = {
  detail: any;
};

type State = {
  plan: { param: any[] } & any;
  useGroup: boolean;
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      plan: props?.detail || {},
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

  renderSelectStructure() {
    const {
      plan: { structureType }
    } = this.state;

    const content = () => {
      switch (structureType) {
        case 'branch':
          return (
            <SelectBranches
              label="Select Branch"
              name="structureTypeIds"
              onSelect={this.onChange}
            />
          );
        case 'department':
          return (
            <SelectDepartments
              label="Select Department"
              name="structureTypeIds"
              onSelect={this.onChange}
            />
          );
        case 'operation':
          return (
            <SelectOperations
              label="Select Operation"
              name="structureTypeIds"
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

  renderPlanConfig(param) {
    const {
      plan: { config = {}, params = [], cardType }
    } = this.state;

    const handleChange = doc => {
      const updatedParams = params.map(item =>
        item._id === param._id ? { ...item, ...doc } : item
      );

      this.onChange(updatedParams, 'params');
    };

    const handleRemomve = () => {
      const updatedParams = params.filter(item => item._id !== param._id);
      this.onChange(updatedParams, 'params');
    };

    const content = ({ closeModal }) => {
      const updatedProps = {
        closeModal,
        cardType,
        pipelineId: config.pipelineId,
        plan: param,
        onSave: handleChange
      };

      return <PlanForm {...updatedProps} />;
    };

    const trigger = (
      <PlanCard>
        <div>
          <h4>{param.name}</h4>
          {param?.date ? moment(param?.date).format('lll HH:mm') : '-'}
        </div>
        <RemoveRow color="red" onClick={handleRemomve} />
      </PlanCard>
    );

    return (
      <ModalTrigger title={`Edit Plan`} content={content} trigger={trigger} />
    );
  }

  renderGeneralConfig() {
    const { plan } = this.state;
    const { config } = plan;

    const handleChange = (e: React.FormEvent<HTMLElement>) => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      this.onChange(value, name);
    };

    const handleConfigChange = (value, name) => {
      this.setState({
        plan: { ...plan, config: { ...config, [name]: value } }
      });
    };

    return (
      <FormContainer padding="15px" column>
        <FormGroup>
          <ControlLabel required>{__('Name')}</ControlLabel>
          <FormControl
            name="name"
            required
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
                value={plan?.cardType}
                options={CARDTYPES}
                multi={false}
                onChange={props => this.onChange(props?.value, 'cardType')}
              />
            </FormGroup>
            {plan?.cardType && (
              <BoardSelectContainer
                type={plan?.cardType}
                boardId={config?.boardId}
                pipelineId={config?.pipelineId}
                stageId={config?.stageId}
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

  renderPlansContent() {
    const { plan } = this.state;
    const { params = [] } = plan;

    if (!params?.length) {
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
        {params.map(param => this.renderPlanConfig(param))}
      </FormContainer>
    );
  }

  renderAddPlanForm() {
    const { plan } = this.state;
    const { params = [], config, cardType } = plan;

    if (!config?.pipelineId) {
      return null;
    }
    const trigger = <Button>{__('Add')}</Button>;

    const content = ({ closeModal }) => {
      const updatedProps = {
        closeModal,
        cardType,
        pipelineId: config.pipelineId,
        plan: { _id: Math.random() },
        onSave: doc =>
          this.setState({ plan: { ...plan, params: [...params, doc] } })
      };

      return <PlanForm {...updatedProps} />;
    };

    return (
      <ModalTrigger title="Add Plan" content={content} trigger={trigger} />
    );
  }

  renderContent() {
    const { plan } = this.state;
    const { config } = plan;

    return (
      <Steps>
        <Step title="General" img="/images/icons/erxes-24.svg">
          {this.renderGeneralConfig()}
        </Step>

        <Step
          title="Plan"
          img="/images/icons/erxes-21.svg"
          noButton={!config?.pipelineId}
          additionalButton={this.renderAddPlanForm()}
        >
          {this.renderPlansContent()}
        </Step>
      </Steps>
    );
  }

  render() {
    return <StepWrapper>{this.renderContent()}</StepWrapper>;
  }
}

export default Form;
