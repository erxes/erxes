import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';

const propTypes = {
  object: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
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
    return (
      <Tip text="Delete">
        <Button bsStyle="link" onClick={this.remove}>
          <i className="ion-close-circled" />
        </Button>
      </Tip>
    );
  }

  renderEditAction() {
    const { object, save } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit">
          <i className="ion-edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger} size={this.size}>
        {this.renderForm({ object, save })}
      </ModalTrigger>
    );
  }

  renderActions() {
    return (
      <td className="text-right">
        <ActionButtons>
          {this.renderEditAction()}
          {this.renderRemoveAction()}
        </ActionButtons>
      </td>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
