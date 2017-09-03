import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import { ModalTrigger } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { Pagination } from '/imports/react-ui/common';
import Sidebar from '../../Sidebar';

const propTypes = {
  objects: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderObjects() {
    const { objects, remove, save } = this.props;

    return objects.map(object => this.renderRow({ key: object._id, object, remove, save }));
  }

  render() {
    const { loadMore, hasMore, save } = this.props;

    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> {this.title}
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title={this.title} trigger={trigger}>
        {this.renderForm({ save })}
      </ModalTrigger>
    );

    const content = (
      <Pagination loadMore={loadMore} hasMore={hasMore}>
        {this.renderContent()}
      </Pagination>
    );

    return (
      <div>
        <Wrapper
          header={<Wrapper.Header breadcrumb={this.breadcrumb()} />}
          leftSidebar={<Sidebar />}
          actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
          content={content}
        />
      </div>
    );
  }
}

List.propTypes = propTypes;

export default List;
