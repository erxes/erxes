import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { Form } from '../containers';

const propTypes = {
  emailTemplate: PropTypes.object.isRequired,
  removeEmailTemplate: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeEmailTemplate = this.removeEmailTemplate.bind(this);
  }

  removeEmailTemplate() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { emailTemplate, removeEmailTemplate } = this.props;

    removeEmailTemplate(emailTemplate._id, error => {
      if (error) {
        return Alert.error(error.message);
      }

      return Alert.success('Email template has deleted.');
    });
  }

  render() {
    const { emailTemplate } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{emailTemplate.name}</td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit emailTemplate" trigger={editTrigger}>
              <Form emailTemplate={emailTemplate} />
            </ModalTrigger>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeEmailTemplate}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
