import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button, Icon } from 'modules/common/components';

const propTypes = {
  object: PropTypes.object,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
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
      this.props.object
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
          <div className="pull-right">
            <Button btnStyle="simple" onClick={onClick}>
              <Icon icon="close" />
              Cancel
            </Button>

            <Button btnStyle="success" type="submit">
              <Icon icon="checkmark" />
              Save
            </Button>
          </div>
        </Modal.Footer>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
