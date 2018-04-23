import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'modules/common/utils';
import { Button } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  object: PropTypes.object,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class Form extends Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();

    const { __ } = this.context;
    const fields = this.generateDoc();

    const type = fields.doc.formType;

    if (type === 'team') {
      if (fields.doc.channelIds.length === 0)
        return Alert.error(__('Choose channel'));
      if (!fields.doc.details.description)
        return Alert.error(__('Write description'));
      if (!fields.doc.details.fullName)
        return Alert.error(__('Write full name'));
      if (!fields.doc.details.location)
        return Alert.error(__('Choose location'));
      if (!fields.doc.details.position)
        return Alert.error(__('Write position'));
      if (!fields.doc.email) return Alert.error(__('Write email'));
      if (!fields.doc.username) return Alert.error(__('Write username'));
    }

    if (type === 'email-template') {
      if (!fields.doc.name) return Alert.error(__('Write name'));
      if (!fields.doc.content) return Alert.error(__('Write content'));
    }

    this.props.save(
      fields,
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
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={onClick}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.contextTypes = contextTypes;

export default Form;
