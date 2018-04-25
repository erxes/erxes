import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  DataWithLoader,
  SortableList,
  ModalTrigger,
  Button
} from 'modules/common/components';
import { collectOrders } from 'modules/deals/utils';
import { PipelineForm } from '../containers';
import { PipelineRow } from './';
import { PipelineContainer } from '../styles';

const propTypes = {
  pipelines: PropTypes.array,
  save: PropTypes.func,
  updateOrder: PropTypes.func,
  remove: PropTypes.func,
  boardId: PropTypes.string,
  loading: PropTypes.bool
};

class Pipelines extends Component {
  constructor(props) {
    super(props);

    this.onChangePipelines = this.onChangePipelines.bind(this);

    this.state = {
      showEditForm: false,
      currentPipeline: null,
      pipelines: props.pipelines
    };
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

  onRowEdit(pipeline) {
    this.setState({ currentPipeline: pipeline, showEditForm: true });
  }

  renderRows() {
    const child = pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        onEdit={() => this.onRowEdit(pipeline)}
      />
    );

    const { pipelines } = this.state;

    return (
      <SortableList
        fields={pipelines}
        child={child}
        onChangeFields={this.onChangePipelines}
        showDragHandler={false}
      />
    );
  }

  remove(pipelines) {
    const pipeline = pipelines[0];

    this.props.remove(pipeline._id);
  }

  render() {
    const { __ } = this.context;
    const { boardId, save, pipelines, loading } = this.props;
    const { currentPipeline } = this.state;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        Add pipeline
      </Button>
    );

    const rightActionBar = boardId && (
      <ModalTrigger title="Add pipeline" trigger={trigger}>
        <PipelineForm boardId={boardId} save={save} />
      </ModalTrigger>
    );

    const data = (
      <Fragment>
        <Wrapper.ActionBar right={rightActionBar} />
        <PipelineContainer>
          <ul>
            <li>
              <span>{__('Pipeline')}</span>
            </li>
          </ul>

          <PipelineForm pipeline={currentPipeline} />
          <div id="pipelines">{this.renderRows()}</div>
        </PipelineContainer>
      </Fragment>
    );

    return (
      <DataWithLoader
        data={data}
        loading={loading}
        count={pipelines.length}
        emptyText="There is no pipeline in this board."
        emptyImage="/images/robots/robot-05.svg"
      />
    );
  }
}

Pipelines.propTypes = propTypes;
Pipelines.contextTypes = {
  __: PropTypes.func
};

export default Pipelines;
