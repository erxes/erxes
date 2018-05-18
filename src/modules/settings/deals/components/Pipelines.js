import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { EmptyState, SortableList, Button } from 'modules/common/components';
import { collectOrders } from 'modules/deals/utils';
import { PipelineForm } from '../containers';
import { PipelineRow } from './';
import { PipelineContainer } from '../styles';

const propTypes = {
  pipelines: PropTypes.array,
  save: PropTypes.func,
  updateOrder: PropTypes.func,
  remove: PropTypes.func,
  boardId: PropTypes.string
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

  renderContent() {
    const { __ } = this.context;
    const { pipelines } = this.props;

    if (pipelines.length === 0) {
      return (
        <EmptyState
          size="full"
          text="There is no pipeline in this board."
          image="/images/robots/robot-05.svg"
        />
      );
    }

    return (
      <PipelineContainer>
        <h3>{__('Pipeline')}</h3>
        {this.renderRows()}
      </PipelineContainer>
    );
  }

  render() {
    const { boardId, save } = this.props;
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

    return (
      <Fragment>
        <Wrapper.ActionBar right={rightActionBar} />
        {this.renderContent()}

        <PipelineForm
          boardId={boardId}
          save={save}
          pipeline={currentPipeline}
          show={showModal}
          closeModal={this.closeModal}
        />
      </Fragment>
    );
  }
}

Pipelines.propTypes = propTypes;
Pipelines.contextTypes = {
  __: PropTypes.func
};

export default Pipelines;
