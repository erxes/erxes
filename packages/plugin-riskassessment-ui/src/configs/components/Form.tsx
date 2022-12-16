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
  EmptyState
} from '@erxes/ui/src';
import { cardTypes } from '../../common/constants';
import {
  SelectCustomFields,
  SelectWithRiskAssessment
} from '../../common/utils';
import { Features, ListItem, Block } from '../../styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
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
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      cardType: props?.config?.cardType || '',
      boardId: props?.config?.boardId || '',
      pipelineId: props?.config?.pipelineId || '',
      stageId: props?.config?.stageId || '',
      customFieldId: props?.config?.customFieldId || null,
      configs: props?.config?.configs || []
    };

    this.renderForm = this.renderForm.bind(this);
  }

  generateDoc() {
    const { config } = this.props;

    if (config) {
      return { doc: { ...this.state }, configId: config._id };
    }

    return { ...this.state };
  }

  renderForm(formProps: IFormProps) {
    const {
      cardType,
      boardId,
      pipelineId,
      stageId,
      customFieldId,
      configs
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

    const onChangeCustomFields = ({ value, _id }) => {
      this.setState({ customFieldId: _id, configs: value });
    };

    const onChangeConfig = (config, field) => {
      const updatedFieldConfig = configs.map(fieldConfig =>
        fieldConfig.value === field.value
          ? { ...fieldConfig, riskAssessmentId: config.value }
          : fieldConfig
      );

      return this.setState({ configs: updatedFieldConfig });
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
            <h4>{__('Configration')}</h4>
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
                  <SelectWithRiskAssessment
                    name="riskAssessment"
                    label="select risk assessment"
                    initialValue={field.riskAssessmentId}
                    onSelect={e => onChangeConfig(e, field)}
                    ignoreIds={configs
                      .map(config => config.riskAssessmentId)
                      .filter(id => id)}
                  />
                </ListItem>
              ))
            ) : (
              <EmptyState text="No Selection" icon="file-landscape-alt" />
            )}
          </Block>
        </Features>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            Cancel
          </Button>
          {renderButton({
            text: 'Risk assessment config',
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
