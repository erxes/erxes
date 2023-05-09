import { BarItems, Icon } from '@erxes/ui/src';
import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { highlight } from '@erxes/ui/src/utils/animations';

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

class GrantActionComponent extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      params: props.initialProps || {}
    };
  }

  handleChange = (value, name) => {
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

  renderChangeCardType(sourceType: string) {
    const { params } = this.state;

    const handleSelect = ({ value }) => {
      this.handleChange(value, 'type');
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
        {params['type'] !== sourceType && <BoardSelect {...updateProps} />}
      </>
    );
  }

  render() {
    const { action, object, initialProps } = this.props;

    if (!action) {
      return null;
    }

    if (action === 'editItem') {
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

export default GrantActionComponent;
