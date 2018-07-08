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
  data: PropTypes.shape({
    form: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      buttonText: PropTypes.string,
      themeColor: PropTypes.string,
      featuredImage: PropTypes.string,

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
    {({ currentStatus, onsubmit, onCreateNew, sendEmail }) =>
      <FormWithData
        {...props}
        currentStatus={currentStatus}
        onsubmit={onsubmit}
        onCreateNew={onCreateNew}
        sendEmail={sendEmail}
      />
    }
  </AppConsumer>
)

export default WithContext;
