import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { Form } from '../containers';


const propTypes = {
  form: PropTypes.object.isRequired,
  removeForm: PropTypes.func.isRequired,
  duplicateForm: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeForm = this.removeForm.bind(this);
    this.duplicateForm = this.duplicateForm.bind(this);
  }

  removeForm() {
    if (!confirm('Are you sure ?')) return; // eslint-disable-line

    const { form, removeForm } = this.props;

    removeForm(form._id, (error) => {
      if (error) {
        return Alert.error(error.reason);
      }

      return Alert.success('Form has deleted.');
    });
  }

  duplicateForm() {
    if (!confirm('Are you sure ?')) return; // eslint-disable-line

    const { form, duplicateForm } = this.props;

    duplicateForm(form._id, (error) => {
      if (error) {
        return Alert.error(error.reason || error.message);
      }

      return Alert.success('Form has duplicated.');
    });
  }

  render() {
    const form = this.props.form;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{form.title}</td>
        <td>{form.description}</td>
        <td>{moment(form.createdAt).format('DD MMM YYYY, HH:mm')}</td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit form" trigger={editTrigger}>
              <Form form={this.props.form} />
            </ModalTrigger>

            <Tip text="Manage Fields">
              <a href={`/settings/forms/manage-fields/${form._id}`}>
                <i className="ion-navicon-round" />
              </a>
            </Tip>

            <Tip text="Duplicate">
              <Button bsStyle="link" onClick={this.duplicateForm}>
                <i className="ion-ios-browsers" />
              </Button>
            </Tip>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeForm}>
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
