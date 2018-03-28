import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ModalTrigger,
  Tip,
  Button,
  Icon,
  ActionButtons
} from 'modules/common/components';

const propTypes = {
  object: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderRemoveAction = this.renderRemoveAction.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    this.props.remove(this.props.object._id);
  }

  renderRemoveAction() {
    const { __ } = this.context;
    return (
      <Tip text={__('Delete')}>
        <Button btnStyle="link" onClick={this.remove} icon="close" />
      </Tip>
    );
  }

  renderEditAction() {
    const { object, save } = this.props;
    const { __ } = this.context;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderForm({ object, save })}
      </ModalTrigger>
    );
  }

  renderActions() {
    return (
      <td>
        <ActionButtons>
          {this.renderEditAction()}
          {this.renderRemoveAction()}
        </ActionButtons>
      </td>
    );
  }
}

Row.propTypes = propTypes;
Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
