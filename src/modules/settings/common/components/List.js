import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { ModalTrigger } from '../../../common';
import { Wrapper } from '../../../layout/components';
import Sidebar from '../../Sidebar';

const propTypes = {
  objects: PropTypes.array,
};

class List extends Component {
  constructor(props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderObjects() {

    const objects = this.props.objects || [];

    return objects.map(object =>
      this.renderRow({
        key: object._id,
        object,
      }),
    );
  }

  render() {
    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> {this.title}
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title={this.title} trigger={trigger}>
        {this.renderForm()}
      </ModalTrigger>
    );

    const content = (
      <div>
        {this.renderContent()}
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.breadcrumb()} />}
        leftSidebar={<Sidebar />}
        actionBar={<Wrapper.ActionBar left={actionBarLeft} />}
        content={content}
      />
    );
  }
}

List.propTypes = propTypes;

export default List;
