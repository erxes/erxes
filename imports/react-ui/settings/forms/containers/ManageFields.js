import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { ManageFields } from '../components';

const ManageFieldsContainer = props => {
  const { formQuery } = props;

  if (formQuery.loading) {
    return false;
  }

  const form = formQuery.formDetail;
  const fields = [];

  // cloning graphql results, because in component we need to change
  // each field's attributes and it is immutable. so making it mutable
  form.fields.forEach(field => {
    fields.push({ ...field });
  });

  // common callback
  const callback = error => {
    if (error) {
      return Alert.error(error.message);
    }

    return Alert.success('Congrats');
  };

  // create field
  const addField = (doc, cb) => {
    Meteor.call('forms.addField', { formId: props.formId, doc }, (err, res) => {
      if (err) {
        return Alert.error(err.message);
      }

      cb(res);
      return Alert.success('Congrats');
    });
  };

  // edit field
  const editField = (_id, doc) => {
    Meteor.call('forms.editField', { _id, doc }, callback);
  };

  // delete field
  const deleteField = _id => {
    if (confirm('Are you sure ?')) {
      // eslint-disable-line
      Meteor.call('forms.removeField', { _id }, callback);
    }
  };

  // update orders
  const onSort = fields => {
    const orderDics = [];

    _.each(fields, (field, index) => {
      orderDics.push({ _id: field._id, order: index });
    });

    Meteor.call('forms.updateFieldsOrder', { orderDics }, callback);
  };

  const updatedProps = {
    ...props,
    addField,
    editField,
    deleteField,
    onSort,
    formTitle: form.title,
    fields,
  };

  return <ManageFields {...updatedProps} />;
};

ManageFieldsContainer.propTypes = {
  formQuery: PropTypes.object,
  formFieldsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query formDetail($formId: String!) {
        formDetail(_id: $formId) {
          _id
          title
          fields {
            _id
            type
            validation
            text
            description
            options
            isRequired
            order
          }
        }
      }
    `,
    {
      name: 'formQuery',
      options: ({ formId }) => {
        return {
          variables: {
            formId,
          },
        };
      },
    },
  ),
)(ManageFieldsContainer);
