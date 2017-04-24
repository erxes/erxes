/* eslint-disable react/jsx-filename-extension */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { connection } from '../connection';
import { Form as DumbForm } from '../components';
import { saveForm, createNew } from '../actions';

const Form = (props) => {
  const extendedProps = {
    ...props,
    form: props.data.form,
    integrationName: connection.data.integrationName,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbForm {...extendedProps} />;
};

Form.propTypes = {
  data: PropTypes.shape({
    form: PropTypes.shape({
      title: PropTypes.string,

      fields: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string,
        check: PropTypes.string,
        text: PropTypes.string,
        description: PropTypes.string,
        options: PropTypes.arrayOf(PropTypes.string),
        isRequired: PropTypes.bool,
        order: PropTypes.number,
      })),
    }),
    loading: PropTypes.bool,
  }),
};

const mapStateToProps = state => ({
  currentStatus: state.currentStatus,
});

const mapDispatchToProps = dispatch => ({
  onSubmit(doc) {
    dispatch(saveForm(doc));
  },

  onCreateNew() {
    dispatch(createNew());
  },
});

const FormWithData = graphql(
  gql`
    query form($formId: String) {
      form(formId: $formId) {
        title

        fields {
          _id
          formId
          name
          type
          check
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
    options: () => ({
      fetchPolicy: 'network-only',
      variables: {
        formId: connection.data.formId,
      },
    }),
  },
)(Form);

export default connect(mapStateToProps, mapDispatchToProps)(FormWithData);
