import React, { Component } from 'react';
import { ModalTrigger, Icon, Button } from 'modules/common/components';
import WidgetForm from './WidgetForm';

class Widget extends Component {
  render() {
    const trigger = (
      <Button btnStyle="success" size="small">
        <Icon icon="email" /> Message
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
