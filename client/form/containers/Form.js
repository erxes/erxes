import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connection } from '../connection';
import { Form as DumbForm } from '../components';
import { AppConsumer } from './AppContext';

const Form = (props) => {
  const extendedProps = {
    ...props,
    form: props.data.form,
    integrationName: connection.data.integrationName,
    formConfig: connection.data.formData,
  };

  if (props.data.loading) {
    return null;
  }

  return <DumbForm {...extendedProps} />;
};

Form.propTypes = {
  data: PropTypes.object
};

const FormWithData = graphql(
  gql`
    query form($formId: String) {
      form(formId: $formId) {
        title
        description
        buttonText
        themeColor

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
          validation
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

const WithContext = (props) => (
  <AppConsumer>
    {({ currentStatus, saveForm, createNew, sendEmail }) =>
      <FormWithData
        {...props}
        currentStatus={currentStatus}
        onSubmit={saveForm}
        onCreateNew={createNew}
        sendEmail={sendEmail}
      />
    }
  </AppConsumer>
)

export default WithContext;
