import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { FORM_LOAD_TYPES, FORM_SUCCESS_ACTIONS } from '/imports/api/integrations/constants';
import { Form } from '../components';
import { Spinner } from '/imports/react-ui/common';
import { saveCallback } from './utils';

const FormContainer = props => {
  const { brandsQuery, formsQuery, integration, refetch } = props;

  if (brandsQuery.loading || formsQuery.loading) {
    return <Spinner />;
  }

  const brands = brandsQuery.brands;
  const forms = formsQuery.forms;

  const save = doc => saveCallback(doc, 'addForm', 'editForm', integration, refetch);

  const loadTypes = Object.values(FORM_LOAD_TYPES);
  loadTypes.splice(-1, 1);

  const successActions = Object.values(FORM_SUCCESS_ACTIONS);
  successActions.splice(-1, 1);

  const updatedProps = {
    ...props,
    brands,
    forms,
    save,
    loadTypes,
    successActions,
  };

  return <Form {...updatedProps} />;
};

FormContainer.propTypes = {
  integration: PropTypes.object,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  refetch: PropTypes.func,
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
          code
        }
      }
    `,
    {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only',
      }),
    },
  ),
  graphql(
    gql`
      query forms {
        forms {
          _id
          title
          code
        }
      }
    `,
    {
      name: 'formsQuery',
      options: () => ({
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(FormContainer);
