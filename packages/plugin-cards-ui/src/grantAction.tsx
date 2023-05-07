import BoardSelect from '@erxes/ui-cards/src/boards/containers/BoardSelect';
import React from 'react';

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

  renderMoveAction() {
    const { onChange } = this.props;

    const { params } = this.state;

    const handleChange = (value, name) => {
      params[name] = value;

      onChange(params);
    };

    const updateProps = {
      ...params,
      onChangeBoard: e => handleChange(e, 'boardId'),
      onChangePipeline: e => handleChange(e, 'pipelineId'),
      onChangeStage: e => handleChange(e, 'stageId')
    };

    return <BoardSelect {...updateProps} />;
  }

  render() {
    const { action } = this.props;

    if (!action) {
      return null;
    }

    if (action === 'moveCard') {
      return this.renderMoveAction();
    }
  }
}

export default GrantActionComponent;
