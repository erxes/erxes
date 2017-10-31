import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import {
  Tip,
  ActionButtons,
  Button,
  Label,
  Icon
} from 'modules/common/components';
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
      <td>
        <ActionButtons>
          <Tip text="Manage Fields">
            <Link to={`/fields/manage/form/${object._id}`}>
              <Button btnStyle="link">
                <Icon icon="navicon-round" />
              </Button>
            </Link>
          </Tip>

          <Tip text="Duplicate">
            <Button btnStyle="link" onClick={this.duplicateForm}>
              <Icon icon="ios-browsers" />
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
