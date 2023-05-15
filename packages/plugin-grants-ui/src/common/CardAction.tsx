import { BarItems, CollapseContent, Icon, colors } from '@erxes/ui/src';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import styled, { css } from 'styled-components';
import { highlight } from '@erxes/ui/src/utils/animations';
import gql from 'graphql-tag';
import { queries } from '@erxes/ui-cards/src/boards/graphql';
import { useQuery } from 'react-apollo';
import Select from 'react-select-plus';
import { IItem } from '@erxes/ui-cards/src/boards/types';
import { FormColumn, FormWrapper, LinkButton } from '@erxes/ui/src/styles/main';
import styledTS from 'styled-components-ts';

type Props = {
  action: string;
  initialProps: any;
  object: any;
  onChange: (params: any) => void;
};

type State = {
  params: any;
};

const Card = styled.div`
  display: flex;
  width: 150px;
  height: 40px;
  text-align: center;
  margin-bottom: 5px;
  border-radius: 6px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  justify-content: center;
  place-items: center;
  cursor: pointer;
  gap: 5px;

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;

const Row = styled.div`
  display: flex;
  place-items: center;
  justify-content: space-between;
  gap: 5px;
`;

export const ListItem = styledTS<{
  column?: number;
}>(styled.div)`
  background: ${colors.colorWhite};
  padding: 5px;
  margin-bottom: 10px;
  border-left: 2px solid transparent; 
  border-top: none;
  border-radius: 4px;
  box-shadow: none;
  left: auto;
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    box-shadow: 0 2px 8px ${colors.shadowPrimary};
    border-color: ${colors.colorSecondary};
    border-top: none;
  }
  ${props =>
    props.column &&
    css`
      width: ${100 / props.column}%;
      display: inline-block;
    `}
`;

export const RemoveRow = styled.div`
  color: ${colors.colorCoreRed};
  text-align: end;

  &:hover {
    cursor: pointer;
  }
`;

function SelectStage({
  pipelineId,
  initialValue,
  label,
  name,
  excludeIds,
  onSelect
}: {
  pipelineId: string;
  initialValue?: string;
  label: string;
  name: string;
  excludeIds?: string[];
  onSelect: (props: { value: string }) => void;
}) {
  const queryVariables: any = { pipelineId };

  if (!!excludeIds?.length) {
    queryVariables.excludeIds = excludeIds;
  }

  const { data, loading } = useQuery(gql(queries.stages), {
    variables: queryVariables,
    fetchPolicy: 'network-only',
    skip: !pipelineId
  });

  const options = (data?.stages || []).map(stage => ({
    value: stage._id,
    label: stage.name
  }));

  return (
    <FormGroup>
      <ControlLabel required>{__(label)}</ControlLabel>
      <Select
        isRequired={true}
        name={name}
        placeholder={'Choose a stage'}
        value={initialValue}
        onChange={onSelect}
        options={options}
        isLoading={loading}
      />
    </FormGroup>
  );
}

class CardActionComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      params: props.initialProps || {}
    };
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
    const { object } = this.props;
    const { pipeline } = object || ({} as IItem);

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
              label={`source stage`}
              pipelineId={pipeline._id}
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
      object: { pipeline }
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
              <ControlLabel>{__('Logic')}</ControlLabel>
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
              pipelineId={pipeline?._id || null}
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

  renderChangeCardType(sourceType: string) {
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

    const options = [
      { value: 'deal', label: 'Deal', icon: 'piggy-bank' },
      { value: 'task', label: 'Task', icon: 'file-check-alt' },
      { value: 'ticket', label: 'Ticket', icon: 'ticket' }
    ].filter(option => option.value !== sourceType);

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Card Type')}</ControlLabel>
          <BarItems>
            {options.map(option => {
              return (
                <Card
                  key={option.value}
                  className={params['type'] === option.value ? 'active' : ''}
                  onClick={() => handleSelect({ value: option.value })}
                >
                  <Icon icon={option.icon} />
                  <ControlLabel>{option.label}</ControlLabel>
                </Card>
              );
            })}
          </BarItems>
        </FormGroup>
        {params['type'] !== sourceType && (
          <>
            <CollapseContent title="Settings" compact>
              <BoardSelect {...updateProps} />
              <FormGroup>
                <ControlLabel required>{__('Name')}</ControlLabel>
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
    const { action, object, initialProps } = this.props;

    if (!action) {
      return null;
    }

    if (action === 'changeStage') {
      const extraProps = {
        boardId: object.boardId,
        pipelineId: object.pipeline._id,
        stageId: object.stageId
      };
      return this.renderMoveAction(extraProps);
    }
    if (action === 'changeCardType') {
      return this.renderChangeCardType(initialProps.sourceType || '');
    }
  }
}

export default CardActionComponent;
