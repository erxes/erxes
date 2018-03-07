import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Tip, ActionButtons, Button, Label } from 'modules/common/components';
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
    const { __ } = this.context;
    const { object } = this.props;

    return (
      <td>
        <ActionButtons>
          <Tip text={__('Manage Fields')}>
            <Link to={`/settings/forms/fields/manage/${object._id}`}>
              <Button btnStyle="link" icon="navicon-round" />
            </Link>
          </Tip>

          <Tip text={__('Duplicate')}>
            <Button
              btnStyle="link"
              onClick={this.duplicateForm}
              icon="ios-browsers"
            />
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
          <Label ignoreTrans>{object.code}</Label>
        </td>
        <td>{object.description}</td>
        <td>{moment(object.createdAt).format('DD MMM YYYY')}</td>

        {this.renderActions()}
      </tr>
    );
  }
}

Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
