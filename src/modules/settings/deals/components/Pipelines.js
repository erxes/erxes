import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  DataWithLoader,
  SortableList,
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

    this.closeModal = this.closeModal.bind(this);
    this.onChangePipelines = this.onChangePipelines.bind(this);

    this.state = {
      showModal: false,
      currentPipeline: null,
      pipelines: props.pipelines
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pipelines !== this.props.pipelines) {
      this.setState({ pipelines: nextProps.pipelines });
    }
  }

  closeModal() {
    this.setState({ showModal: false });
  }

  addPipeline() {
    this.setState({
      showModal: true,
      currentPipeline: null
    });
  }

  editPipeline(pipeline) {
    this.setState({
      showModal: true,
      currentPipeline: pipeline
    });
  }

  onChangePipelines(pipelines) {
    this.setState({ pipelines });

    this.props.updateOrder(collectOrders(pipelines));
  }

  renderRows() {
    const child = pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        edit={() => this.editPipeline(pipeline)}
        remove={this.props.remove}
      />
    );

    const { pipelines } = this.state;

    return (
      <SortableList
        fields={pipelines}
        child={child}
        onChangeFields={this.onChangePipelines}
      />
    );
  }

  render() {
    const { __ } = this.context;
    const { boardId, save, pipelines, loading } = this.props;
    const { currentPipeline, showModal } = this.state;

    const rightActionBar = (
      <Button
        btnStyle="success"
        size="small"
        icon="add"
        onClick={() => this.addPipeline()}
      >
        Add pipeline
      </Button>
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

          <PipelineForm
            boardId={boardId}
            save={save}
            pipeline={currentPipeline}
            show={showModal}
            closeModal={this.closeModal}
          />

          {this.renderRows()}
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
