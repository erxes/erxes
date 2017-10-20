import React from 'react';
import moment from 'moment';
import { Button, Label } from 'react-bootstrap';
import { Tip, ActionButtons } from 'modules/common/components';
import { Row as CommonRow } from '../../common/components';
import { Form } from './';

class Row extends CommonRow {
  constructor(props) {
    super(props);

    this.duplicateForm = this.duplicateForm.bind(this);
  }

  renderForm(props) {
    return <Form {...props} />;
  }

  duplicateForm() {
    const { object, duplicateForm } = this.props;

    duplicateForm(object._id);
  }

  renderActions() {
    const { object } = this.props;

    return (
      <td className="text-right">
        <ActionButtons>
          <Tip text="Manage Fields">
            <Button
              bsStyle="link"
              href={`/settings/forms/manage-fields/${object._id}`}
            >
              <i className="ion-navicon-round" />
            </Button>
          </Tip>

          <Tip text="Duplicate">
            <Button bsStyle="link" onClick={this.duplicateForm}>
              <i className="ion-ios-browsers" />
            </Button>
          </Tip>

          {this.renderEditAction()}
          {this.renderRemoveAction()}
        </ActionButtons>
      </td>
    );
  }

  render() {
    const { object } = this.props;

    return (
      <tr>
        <td>{object.title}</td>
        <td>
          <Label>{object.code}</Label>
        </td>
        <td>{object.description}</td>
        <td>{moment(object.createdAt).format('DD MMM YYYY')}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

export default Row;
