import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  DataWithLoader,
  Button,
  ModalTrigger
} from 'modules/common/components';
import { Boards, PipelineForm } from '../containers';
import { Pipelines } from './';

const propTypes = {
  queryParams: PropTypes.object,
  loading: PropTypes.bool,
  pipelines: PropTypes.array,
  boardId: PropTypes.string,
  removePipeline: PropTypes.func,
  savePipeline: PropTypes.func,
  pipelinesUpdateOrder: PropTypes.func
};

class Home extends Component {
  render() {
    const { loading, pipelines, boardId } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Deal') }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="plus">
        Add pipeline
      </Button>
    );

    const rightActionBar = boardId && (
      <ModalTrigger title="Add pipeline" trigger={trigger}>
        <PipelineForm boardId={boardId} save={this.props.savePipeline} />
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        leftSidebar={<Boards />}
        content={
          <DataWithLoader
            data={
              <Pipelines
                pipelines={pipelines}
                save={this.props.savePipeline}
                remove={this.props.removePipeline}
                updateOrder={this.props.pipelinesUpdateOrder}
              />
            }
            loading={loading}
            count={pipelines.length}
            emptyText="There is no pipeline in this board."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

Home.propTypes = propTypes;
Home.contextTypes = {
  __: PropTypes.func
};

export default Home;
