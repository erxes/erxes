import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { ModalTrigger } from '/imports/react-ui/common';
import WidgetForm from './WidgetForm';

class Widget extends Component {
  render() {
    const trigger = (
      <Button bsStyle="link">
        <i className="ion-plus-circled" /> Message
      </Button>
    );

    return (
      <ModalTrigger title="New message" trigger={trigger}>
        <WidgetForm {...this.props} />
      </ModalTrigger>
    );
  }
}

export default Widget;
