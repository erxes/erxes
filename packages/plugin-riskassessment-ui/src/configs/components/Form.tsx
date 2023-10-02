import BoardSelectContainer from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  Button,
  ControlLabel,
  EmptyState,
  Form as CommonForm,
  FormGroup,
  Toggle,
  __
} from '@erxes/ui/src';
import {
  FormColumn,
  FormWrapper,
  ModalFooter
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';
import { cardTypes } from '../../common/constants';
import {
  SelectCustomFields,
  SelectIndicatorGroups,
  SelectIndicators
} from '../../common/utils';
import { Block, Features, FormContainer, Header, ListItem } from '../../styles';
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
  indicatorId: string;
  indicatorIds: string[];
  groupId: string;
  useCustomFields: boolean;
  useGroups: boolean;
  useMultipleIndicators: boolean;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const useCustomFields =
      !!props?.config?.configs.length && !!props?.config.pipelineId;

    let useGroups = false;
    let useMultipleIndicators = false;
    if (useCustomFields) {
      useMultipleIndicators = props.config.configs.every(
        config => !!config?.indicatorIds?.length
      );
      useGroups = props?.config?.configs.every(config => config.groupId);
    }

    if (props.config?.configs?.indicatorIds) {
      useMultipleIndicators = true;
    }
    if (props.config?.groupId) {
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
      useMultipleIndicators,
      indicatorId: props?.config?.indicatorId || '',
      indicatorIds: props?.config?.indicatorIds || [],
      groupId: props?.config?.groupId || ''
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
      indicatorId,
      groupId
    } = this.state;

    const doc = {
      cardType,
      boardId,
      pipelineId,
      stageId,
      customFieldId,
      configs,
      indicatorId,
      groupId
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
      useGroups,
      useMultipleIndicators
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
            configs={configs}
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
                  name="groupId"
                  label="Select indicators group"
                  initialValue={field.groupId}
                  onSelect={(values, name) =>
                    onChangeConfig(values, name, field)
                  }
                />
              ) : (
                <SelectIndicators
                  name={useMultipleIndicators ? 'indicatorIds' : 'indicatorId'}
                  label={`Select risk indicator${
                    useMultipleIndicators ? 's' : ''
                  }`}
                  initialValue={
                    useMultipleIndicators
                      ? field.indicatorIds
                      : field.indicatorId
                  }
                  onSelect={(values, name) =>
                    onChangeConfig(values, name, field)
                  }
                  multi={useMultipleIndicators}
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
      useMultipleIndicators,
      indicatorId,
      indicatorIds,
      groupId
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
          <ControlLabel>{'Selec Indicators Group'}</ControlLabel>
          <SelectIndicatorGroups
            name="groupId"
            label="Select indicators group"
            initialValue={groupId}
            onSelect={handleChange}
          />
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>{__('Select indicator')}</ControlLabel>
        <SelectIndicators
          name={useMultipleIndicators ? 'indicatorIds' : 'indicatorId'}
          label="Select indicator"
          initialValue={useMultipleIndicators ? indicatorIds : indicatorId}
          onSelect={handleChange}
          multi={useMultipleIndicators}
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
      useGroups,
      useMultipleIndicators
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

      if (name === 'useMultipleIndicators') {
        return this.setState(prev => ({
          useMultipleIndicators: isOpen,
          indicatorIds: [prev.indicatorId].filter(i => i),
          indicatorId: ''
        }));
      }

      this.setState({
        [name]: isOpen,
        configs: name === 'useGroups' ? configs : [],
        indicatorId: config?.indicatorId || '',
        indicatorIds: config?.indicatorIds || [],
        groupId: config?.groupId || ''
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
                <ControlLabel>{__('Use Custom field')}</ControlLabel>
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
                {!useGroups && (
                  <>
                    <ControlLabel>{__('Use Multiple Indicator')}</ControlLabel>
                    <Toggle
                      name="useMultipleIndicators"
                      checked={useMultipleIndicators}
                      onChange={toggleChange}
                    />
                  </>
                )}
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
