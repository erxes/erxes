import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, Modal, Button } from 'react-bootstrap';

const propTypes = {
  object: PropTypes.object,
  save: PropTypes.func,
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    this.props.save(
      this.generateDoc(),
      () => {
        this.context.closeModal();
      },
      this.props.object,
    );
  }

  render() {
    const onClick = () => {
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.save}>
        {this.renderContent(this.props.object || {})}
        <Modal.Footer>
          <ButtonToolbar className="pull-right">
            <Button bsStyle="link" onClick={onClick}>
              Cancel
            </Button>
            <Button type="submit" bsStyle="primary">
              Save
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
