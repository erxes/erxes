import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  DataWithLoader,
  SortableList,
  ModalTrigger,
  Button,
  FormControl
} from 'modules/common/components';
import { collectOrders } from 'modules/deals/utils';
import { BarItems } from 'modules/layout/styles';
import { PipelineForm } from '../containers';
import { PipelineRow } from './';
import { PipelineContainer } from '../styles';

const propTypes = {
  pipelines: PropTypes.array,
  save: PropTypes.func,
  updateOrder: PropTypes.func,
  remove: PropTypes.func,
  toggleBulk: PropTypes.func.isRequired,
  toggleAll: PropTypes.func,
  bulk: PropTypes.array,
  boardId: PropTypes.string,
  loading: PropTypes.bool
};

class Pipelines extends Component {
  constructor(props) {
    super(props);

    this.toggleAll = this.toggleAll.bind(this);
    this.onChangePipelines = this.onChangePipelines.bind(this);

    this.state = { pipelines: props.pipelines };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pipelines !== this.props.pipelines) {
      this.setState({ pipelines: nextProps.pipelines });
    }
  }

  toggleAll() {
    const { toggleAll, pipelines } = this.props;

    toggleAll(pipelines, 'pipelines');
  }

  onChangePipelines(pipelines) {
    this.setState({ pipelines });

    this.props.updateOrder(collectOrders(pipelines));
  }

  renderRows() {
    const { toggleBulk } = this.props;

    const child = pipeline => (
      <PipelineRow
        key={pipeline._id}
        pipeline={pipeline}
        toggleBulk={toggleBulk}
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

  renderEdit(pipelines) {
    const pipeline = pipelines[0];
    const { save } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="edit">
        Edit
      </Button>
    );

    return (
      <ModalTrigger title="Edit pipeline" trigger={trigger}>
        <PipelineForm pipeline={pipeline} save={save} />
      </ModalTrigger>
    );
  }

  render() {
    const { __ } = this.context;
    const { boardId, save, remove, pipelines, loading, bulk } = this.props;

    const leftActionBar = bulk.length > 0 && (
      <BarItems>
        {this.renderEdit(bulk)}

        <Button
          btnStyle="danger"
          size="small"
          icon="cancel-1"
          onClick={() => remove(bulk)}
        >
          Remove
        </Button>
      </BarItems>
    );

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
        <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        <PipelineContainer>
          <ul>
            <li>
              <FormControl
                componentClass="checkbox"
                onChange={this.toggleAll}
              />
            </li>
            <li>
              <span>{__('Pipeline')}</span>
            </li>
          </ul>
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
