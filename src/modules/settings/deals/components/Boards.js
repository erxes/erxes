import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  DataWithLoader,
  Button,
  ModalTrigger
} from 'modules/common/components';
import { Sidebar } from '../containers';
import { Pipelines, PipelineForm } from './';

const propTypes = {
  queryParams: PropTypes.object,
  loading: PropTypes.bool,
  pipelines: PropTypes.array,
  refetch: PropTypes.func,
  boardId: PropTypes.string,
  removePipeline: PropTypes.func,
  savePipeline: PropTypes.func
};

class Boards extends Component {
  render() {
    const { loading, pipelines, refetch, boardId } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Boards' }
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
        leftSidebar={<Sidebar />}
        content={
          <DataWithLoader
            data={<Pipelines pipelines={pipelines} refetch={refetch} />}
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

Boards.propTypes = propTypes;

export default Boards;
