import { CollapseContent, Icon } from '@erxes/ui/src';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';
import { IItem } from '@erxes/ui-cards/src/boards/types';
import { FormColumn, FormWrapper, LinkButton } from '@erxes/ui/src/styles/main';
import { ListItem, RemoveRow, Row } from './styles';
import { SelectCardType, SelectStage } from './common';
import Attribution from '@erxes/ui-automations/src/containers/forms/actions/Attribution';
type Props = {
  action: string;
  initialProps: any;
  source: any;
  onChange: (params: any) => void;
};

type State = {
  params: any;
};

class CardActionComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      params: props.initialProps || {}
    };
  }

  componentDidMount(): void {
    if (this.props.action === 'createRelatedCard') {
      const sourceType = this.props?.source?.type || '';
      this.handleChange(sourceType, 'sourceType');
    }
  }

  handleChange = (value, name: string) => {
    const { onChange } = this.props;
    const { params } = this.state;
    params[name] = value;

    onChange(params);
  };

  renderMoveAction(extraProps: any) {
    const { params } = this.state;

    const updateProps = {
      ...extraProps,
      ...params,
      onChangeBoard: e => this.handleChange(e, 'boardId'),
      onChangePipeline: e => this.handleChange(e, 'pipelineId'),
      onChangeStage: e => this.handleChange(e, 'stageId')
    };

    return <BoardSelect {...updateProps} />;
  }

  renderConfigs() {
    const { params } = this.state;
    const { source } = this.props;
    const { pipelineId } = source || {};

    const {
      configs
    }: {
      configs: {
        _id: string;
        sourceStageId: string;
        destinationStageId: string;
      }[];
    } = params || {};

    const selectedSourceStageIds = configs.map(config => config.sourceStageId);
    const selectedDestinationStageIds = configs.map(
      config => config.destinationStageId
    );

    const removeConfig = _id => {
      params.configs = configs.filter(config => config._id !== _id);

      this.props.onChange(params);
    };

    const onSelect = (value, name, configId) => {
      params.configs = configs.map(config =>
        config._id === configId ? { ...config, [name]: value } : config
      );

      this.props.onChange(params);
    };

    return (configs || []).map(config => (
      <ListItem key={config._id}>
        <RemoveRow onClick={() => removeConfig(config._id)}>
          <Icon icon="times-circle" />
        </RemoveRow>
        <FormWrapper>
          <FormColumn>
            <SelectStage
              name="sourceStageId"
              label={`${params.type} stage`}
              pipelineId={this.state.params.pipelineId}
              initialValue={config.sourceStageId}
              excludeIds={selectedSourceStageIds}
              onSelect={({ value }) =>
                onSelect(value, 'sourceStageId', config._id)
              }
            />
          </FormColumn>
          <FormColumn>
            <SelectStage
              name="destinationStageId"
              label={`Destination stage`}
              pipelineId={pipelineId}
              excludeIds={selectedDestinationStageIds}
              initialValue={config.destinationStageId}
              onSelect={({ value }) =>
                onSelect(value, 'destinationStageId', config._id)
              }
            />
          </FormColumn>
        </FormWrapper>
      </ListItem>
    ));
  }

  renderLogics() {
    const { params } = this.state;
    const {
      source: { pipelineId }
    } = this.props;

    const removeLogic = _id => {
      params.logics = params.logics.filter(logic => logic._id !== _id);

      this.props.onChange(params);
    };

    const onChangeLogic = (_id, value, name) => {
      params.logics = params.logics.map(logic =>
        logic._id === _id ? { ...logic, [name]: value } : logic
      );
      this.props.onChange(params);
    };

    const logicOptions = [
      { value: 'approved', label: 'Approved' },
      { value: 'declined', label: 'Declined' }
    ];

    const generateOptions = (_id, options) => {
      const logics = params.logics
        .filter(logic => logic._id !== _id && logic?.logic)
        .map(({ logic }) => logic);

      options = options.filter(logic => !logics.includes(logic.value));
      return options;
    };

    return params.logics.map(logic => (
      <ListItem key={logic._id}>
        <RemoveRow onClick={() => removeLogic(logic._id)}>
          <Icon icon="times-circle" />
        </RemoveRow>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required>{__('Logic')}</ControlLabel>
              <Select
                value={logic.logic}
                options={generateOptions(logic._id, logicOptions)}
                onChange={({ value }) =>
                  onChangeLogic(logic._id, value, 'logic')
                }
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <SelectStage
              name="targetStageId"
              label="Stage"
              pipelineId={pipelineId || null}
              initialValue={logic.targetStageId}
              onSelect={({ value }) =>
                onChangeLogic(logic._id, value, 'targetStageId')
              }
            />
          </FormColumn>
        </FormWrapper>
      </ListItem>
    ));
  }

  renderCreateRelatedCard({ type }) {
    const { params } = this.state;

    const handleSelect = ({ value }) => {
      this.handleChange(value, 'type');
    };

    const onChange = e => {
      const { value, name } = e.currentTarget as HTMLInputElement;
      this.handleChange(value, name);
    };

    const addConfig = () => {
      params.configs.push({
        _id: Math.random(),
        sourceStageId: null,
        destinationStageId: null
      });

      this.props.onChange(params);
    };

    const addLogics = () => {
      params.logics.push({
        _id: Math.random()
      });

      this.props.onChange(params);
    };

    const updateProps = {
      ...params,
      onChangeBoard: e => this.handleChange(e, 'boardId'),
      onChangePipeline: e => this.handleChange(e, 'pipelineId'),
      onChangeStage: e => this.handleChange(e, 'stageId')
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__('Card Type')}</ControlLabel>
          <SelectCardType
            type={type}
            handleSelect={handleSelect}
            params={params}
          />
        </FormGroup>
        {params['type'] !== type && (
          <>
            <CollapseContent title="Settings" compact>
              <BoardSelect {...updateProps} />
              <FormGroup>
                <Row>
                  <ControlLabel required>{__('Name')}</ControlLabel>
                  <Attribution
                    triggerType={`cards:${params['type']}`}
                    inputName="name"
                    config={params}
                    setConfig={params => this.props.onChange(params)}
                  />
                </Row>
                <FormControl
                  name="name"
                  value={params?.name}
                  onChange={onChange}
                />
              </FormGroup>
            </CollapseContent>
            <Row>
              <FormGroup>
                <ControlLabel>
                  {__(`Track changes ${params?.type || ''}`)}
                </ControlLabel>
                <FormControl
                  checked={!!params?.configs}
                  componentClass="checkbox"
                  onClick={() =>
                    this.handleChange(!params?.configs ? [] : null, 'configs')
                  }
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__(`Logic`)}</ControlLabel>
                <FormControl
                  checked={!!params?.logics}
                  componentClass="checkbox"
                  onClick={() =>
                    this.handleChange(!params?.logics ? [] : null, 'logics')
                  }
                />
              </FormGroup>
            </Row>

            {!!params?.configs && (
              <CollapseContent title="Track Changes Configrations" compact>
                {this.renderConfigs()}
                <LinkButton onClick={addConfig}>
                  <Icon icon="plus-1" /> {__('Add config')}
                </LinkButton>
              </CollapseContent>
            )}
            {!!params?.logics && (
              <CollapseContent title="After logics" compact>
                {this.renderLogics()}
                <LinkButton onClick={addLogics}>
                  <Icon icon="plus-1" /> {__('Add logic')}
                </LinkButton>
              </CollapseContent>
            )}
          </>
        )}
      </>
    );
  }

  render() {
    const { action, source } = this.props;

    if (!action) {
      return null;
    }

    if (action === 'changeStage') {
      return this.renderMoveAction({ ...source });
    }
    if (action === 'createRelatedCard') {
      return this.renderCreateRelatedCard({ ...source });
    }
  }
}

export default CardActionComponent;
