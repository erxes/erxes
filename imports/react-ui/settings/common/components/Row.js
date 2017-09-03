import React, { PropTypes, Component } from 'react';
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
  }

  remove() {
    this.props.remove(this.props.object._id);
  }

  renderActions() {
    const { object, save } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <td className="text-right">
        <ActionButtons>
          <ModalTrigger title="Edit" trigger={editTrigger}>
            {this.renderForm({ object, save })}
          </ModalTrigger>

          <Tip text="Delete">
            <Button bsStyle="link" onClick={this.remove}>
              <i className="ion-close-circled" />
            </Button>
          </Tip>
        </ActionButtons>
      </td>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
