import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Pagination,
  ModalTrigger,
  Button,
  Icon
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import Sidebar from '../../Sidebar';

const propTypes = {
  objects: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderObjects() {
    const { objects, remove, save, refetch } = this.props;

    return objects.map(object =>
      this.renderRow({
        key: object._id,
        object,
        remove,
        refetch,
        save
      })
    );
  }

  render() {
    const { loadMore, hasMore, save } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small">
        <Icon icon="plus" /> {this.title}
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title={this.title} size={this.size} trigger={trigger}>
        {this.renderForm({ save })}
      </ModalTrigger>
    );

    const content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        {this.renderContent()}
      </Pagination>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.breadcrumb()} />}
        leftSidebar={<Sidebar />}
        actionBar={<Wrapper.ActionBar right={actionBarLeft} />}
        content={content}
      />
    );
  }
}

List.propTypes = propTypes;

export default List;
