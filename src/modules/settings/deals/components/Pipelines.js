import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableList } from 'modules/common/components';
import { PipelineRow } from './';
import { PipelineContainer } from '../styles';
import { collectOrders } from 'modules/deals/utils';

const propTypes = {
  pipelines: PropTypes.array.isRequired,
  save: PropTypes.func,
  updateOrder: PropTypes.func,
  remove: PropTypes.func
};

class Pipelines extends Component {
  constructor(props) {
    super(props);

    this.onChangePipelines = this.onChangePipelines.bind(this);

    this.state = { pipelines: props.pipelines };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pipelines !== this.props.pipelines) {
      this.setState({ pipelines: nextProps.pipelines });
    }
  }

  onChangePipelines(pipelines) {
    this.setState({ pipelines });

    this.props.updateOrder(collectOrders(pipelines));
  }

  renderRow() {
    const { save, remove } = this.props;

    const child = pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        save={save}
        remove={remove}
      />
    );

    const { pipelines } = this.state;

    return (
      <SortableList
        fields={pipelines}
        child={child}
        lockAxis="y"
        useDragHandle
        onChangeFields={this.onChangePipelines}
      />
    );
  }

  render() {
    const { __ } = this.context;

    return (
      <PipelineContainer>
        <ul className="head">
          <li>
            <span>{__('Name')}</span>
          </li>
          <li>
            <span>{__('Actions')}</span>
          </li>
        </ul>
        {this.renderRow()}
      </PipelineContainer>
    );
  }
}

Pipelines.propTypes = propTypes;
Pipelines.contextTypes = {
  __: PropTypes.func
};

export default Pipelines;
