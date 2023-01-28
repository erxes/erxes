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
import { SelectCustomFields, SelectRiskIndicator } from '../../common/utils';
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
  isOpenSelectionCustomField: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const isOpenSelectionCustomField =
      !!props?.config?.configs.length && !!props?.config.pipelineId
        ? true
        : false;

    this.state = {
      cardType: props?.config?.cardType || '',
      boardId: props?.config?.boardId || '',
      pipelineId: props?.config?.pipelineId || '',
      stageId: props?.config?.stageId || '',
      customFieldId: props?.config?.customFieldId || null,
      configs: props?.config?.configs || [],
      isOpenSelectionCustomField,
      riskIndicatorId: props?.config?.riskIndicatorId || ''
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
      riskIndicatorId
    } = this.state;

    const doc = {
      cardType,
      boardId,
      pipelineId,
      stageId,
      customFieldId,
      configs,
      riskIndicatorId
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
      cardType
    } = this.state;
    const onChangeCustomFields = ({ value, _id }) => {
      this.setState({ customFieldId: _id, configs: value });
    };
    const onChangeConfig = (config, field) => {
      const updatedFieldConfig = configs.map(fieldConfig =>
        fieldConfig.value === field.value
          ? { ...fieldConfig, riskIndicatorId: config.value }
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
              <SelectRiskIndicator
                name="riskAssessment"
                label="Select risk assessment"
                initialValue={field.riskIndicatorId}
                onSelect={e => onChangeConfig(e, field)}
                ignoreIds={configs
                  .map(config => config.riskIndicatorId)
                  .filter(id => id)}
              />
            </ListItem>
          ))
        ) : (
          <EmptyState text="No Selection" icon="file-landscape-alt" />
        )}
      </>
    );
  }

  renderForm(formProps: IFormProps) {
    const {
      cardType,
      boardId,
      pipelineId,
      stageId,
      customFieldId,
      configs,
      riskIndicatorId,
      isOpenSelectionCustomField
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

    const onChangeToggle = e => {
      const isOpen = e.target.checked;
      this.setState({
        isOpenSelectionCustomField: isOpen,
        configs: [],
        riskIndicatorId: ''
      });
    };
    const onChangeSelectedRiskAssessment = e => {
      this.setState({ riskIndicatorId: e?.value });
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
                <Toggle onChange={onChangeToggle} />
              </FormContainer>
            </FormWrapper>
            {isOpenSelectionCustomField ? (
              this.renderSelectionCustomField()
            ) : (
              <FormGroup>
                <ControlLabel>{__('Select risk assessment')}</ControlLabel>
                <SelectRiskIndicator
                  name="riskIndicator"
                  label="Select risk indicator"
                  initialValue={riskIndicatorId}
                  onSelect={onChangeSelectedRiskAssessment}
                />
              </FormGroup>
            )}
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
