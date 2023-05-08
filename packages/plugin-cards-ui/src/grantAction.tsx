import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import { ControlLabel, FormGroup } from '@erxes/ui/src/components/form';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  action: string;
  initialProps: any;
  onChange: (params: any) => void;
};

type State = {
  params: any;
};

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

  renderMoveAction() {
    const { params } = this.state;

    const updateProps = {
      ...params,
      onChangeStage: e => this.handleChange(e, 'stageId')
    };

    return <BoardSelect {...updateProps} />;
  }

  renderChangeCardType() {
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

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Card Type')}</ControlLabel>
          <Select
            placeholder={__('Choose Card Type')}
            name="type"
            multi={false}
            value={params['type']}
            options={[
              { value: 'deal', label: 'Deal' },
              { value: 'task', label: 'Task' },
              { value: 'ticket', label: 'Ticket' }
            ]}
            onChange={handleSelect}
          />
        </FormGroup>
        {params['type'] && <BoardSelect {...updateProps} />}
      </>
    );
  }

  render() {
    const { action } = this.props;

    if (!action) {
      return null;
    }

    if (action === 'editItem') {
      return this.renderMoveAction();
    }
    if (action === 'changeCardType') {
      return this.renderChangeCardType();
    }
  }
}

export default GrantActionComponent;
