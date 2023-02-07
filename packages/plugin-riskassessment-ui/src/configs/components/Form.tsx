import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import Select from 'react-select-plus';
import React from 'react';
import {
  ControlLabel,
  FormControl,
  FormGroup,
  Form as CommonForm,
  __,
  Button,
  EmptyState,
  Toggle
} from '@erxes/ui/src';
import { cardTypes } from '../../common/constants';
import {
  SelectCustomFields,
  SelectIndicatorGroups,
  SelectRiskIndicator
} from '../../common/utils';
import { Features, ListItem, Block, Header, FormContainer } from '../../styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
type Props = {
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  config?: any;
};

type State = {
  cardType: string;
  boardId: string;
  pipelineId: string;
  stageId: string;
  customFieldId: string;
  configs: any[];
  riskIndicatorId: string;
  indicatorsGroupId: string;
  useCustomFields: boolean;
  useGroups: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const useCustomFields =
      !!props?.config?.configs.length && !!props?.config.pipelineId;

    let useGroups = false;
    if (useCustomFields) {
      useGroups = props?.config?.configs.every(
        config => config.indicatorsGroupId
      );
    }
    if (props.config?.indicatorsGroupId) {
      useGroups = true;
    }

    this.state = {
      cardType: props?.config?.cardType || '',
      boardId: props?.config?.boardId || '',
      pipelineId: props?.config?.pipelineId || '',
      stageId: props?.config?.stageId || '',
      customFieldId: props?.config?.customFieldId || null,
      configs: props?.config?.configs || [],
      useCustomFields,
      useGroups,
      riskIndicatorId: props?.config?.riskIndicatorId || '',
      indicatorsGroupId: props?.config?.indicatorsGroupId || ''
    };

    this.renderForm = this.renderForm.bind(this);
  }

  generateDoc() {
    const { config } = this.props;
    const {
      cardType,
      boardId,
      pipelineId,
      stageId,
      customFieldId,
      configs,
      riskIndicatorId,
      indicatorsGroupId
    } = this.state;

    const doc = {
      cardType,
      boardId,
      pipelineId,
      stageId,
      customFieldId,
      configs,
      riskIndicatorId,
      indicatorsGroupId
    };

    if (config) {
      return { doc: { ...doc }, configId: config._id };
    }

    return { ...doc };
  }

  renderSelectionCustomField() {
    const {
      customFieldId,
      configs,
      boardId,
      pipelineId,
      cardType,
      useGroups
    } = this.state;
    const onChangeCustomFields = ({ value, _id }) => {
      this.setState({ customFieldId: _id, configs: value });
    };
    const onChangeConfig = (value, name, field) => {
      const updatedFieldConfig = configs.map(fieldConfig =>
        fieldConfig.value === field.value
          ? { ...fieldConfig, [name]: value }
          : fieldConfig
      );

      return this.setState({ configs: updatedFieldConfig });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Choose Field')}</ControlLabel>
          <SelectCustomFields
            label="Choose custom field"
            name="customField"
            initialValue={customFieldId}
            onSelect={onChangeCustomFields}
            type={!!boardId && !!pipelineId ? cardType : ''}
          />
        </FormGroup>
        <h5>Selections</h5>
        {configs.length ? (
          configs.map((field, i) => (
            <ListItem key={i}>
              <ControlLabel>{field.label}</ControlLabel>
              {useGroups ? (
                <SelectIndicatorGroups
                  name="indicatorsGroupId"
                  label="Select risk indicators group"
                  initialValue={field.indicatorsGroupId}
                  onSelect={(values, name) =>
                    onChangeConfig(values, name, field)
                  }
                />
              ) : (
                <SelectRiskIndicator
                  name="riskAssessment"
                  label="Select risk indicators"
                  initialValue={field.riskIndicatorId}
                  onSelect={(values, name) =>
                    onChangeConfig(values, name, field)
                  }
                />
              )}
            </ListItem>
          ))
        ) : (
          <EmptyState text="No Selection" icon="file-landscape-alt" />
        )}
      </>
    );
  }

  renderConfigrationField() {
    const {
      useCustomFields,
      useGroups,
      riskIndicatorId,
      indicatorsGroupId
    } = this.state;

    if (useCustomFields) {
      return this.renderSelectionCustomField();
    }

    const handleChange = (values, name) => {
      this.setState({ [name]: values } as Pick<State, keyof State>);
    };

    if (useGroups) {
      return (
        <FormGroup>
          <ControlLabel>{'Selec Risk Indicators Group'}</ControlLabel>
          <SelectIndicatorGroups
            name="indicatorsGroupId"
            label="Select risk indicators group"
            initialValue={indicatorsGroupId}
            onSelect={handleChange}
          />
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>{__('Select risk indicator')}</ControlLabel>
        <SelectRiskIndicator
          name="riskIndicatorId"
          label="Select risk indicator"
          initialValue={riskIndicatorId}
          onSelect={handleChange}
        />
      </FormGroup>
    );
  }

  renderForm(formProps: IFormProps) {
    const {
      cardType,
      boardId,
      pipelineId,
      stageId,
      useCustomFields,
      useGroups
    } = this.state;
    const { renderButton, closeModal } = this.props;
    const { isSubmitted } = formProps;

    const onChangeCardType = e => {
      this.setState({ cardType: e.value });
    };

    const onChangeBoard = e => {
      this.setState({ boardId: e });
    };
    const onChangePipeline = e => {
      this.setState({ pipelineId: e });
    };
    const onChangeStage = e => {
      this.setState({ stageId: e });
    };

    const toggleChange = e => {
      const { name } = e.currentTarget as HTMLInputElement;
      const { configs } = this.state;
      const { config } = this.props;

      const isOpen = e.target.checked;
      this.setState({
        [name]: isOpen,
        configs: name === 'useGroups' ? configs : [],
        riskIndicatorId: config?.riskIndicatorId || '',
        indicatorsGroupId: config?.indicatorsGroupId || ''
      } as any);
    };
    return (
      <>
        <Block>
          <h4>{__('Stage')}</h4>
          <FormGroup>
            <ControlLabel>{__('Type')}</ControlLabel>
            <Select
              placeholder={__('Select Type')}
              value={cardType}
              options={cardTypes}
              multi={false}
              onChange={onChangeCardType}
            />
          </FormGroup>
          <Features isToggled={!!cardType}>
            <BoardSelectContainer
              type={cardType}
              boardId={boardId}
              pipelineId={pipelineId}
              stageId={stageId}
              onChangeBoard={onChangeBoard}
              onChangePipeline={onChangePipeline}
              onChangeStage={onChangeStage}
              autoSelectStage={false}
            />
          </Features>
        </Block>
        <Features isToggled={!!boardId && !!pipelineId}>
          <Block>
            <FormWrapper>
              <FormColumn>
                <Header>{__('Configration')}</Header>
              </FormColumn>
              <FormContainer row align="center" gap>
                <ControlLabel>{__('User Custom field')}</ControlLabel>
                <Toggle
                  name="useCustomFields"
                  checked={useCustomFields}
                  onChange={toggleChange}
                />
                <ControlLabel>{__('Use Groups')}</ControlLabel>
                <Toggle
                  name="useGroups"
                  checked={useGroups}
                  onChange={toggleChange}
                />
              </FormContainer>
            </FormWrapper>
            {this.renderConfigrationField()}
          </Block>
        </Features>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            Cancel
          </Button>
          {renderButton({
            text: 'Risk Indicators config',
            values: this.generateDoc(),
            callback: closeModal,
            isSubmitted,
            object: this.props.config
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default Form;
