import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { Form } from '../components';
import { FORM_LOAD_TYPES, FORM_SUCCESS_ACTIONS } from '../constants';
import { save } from './utils';

const FormContainer = props => {
  const {
    brandsQuery,
    formsQuery,
    integration,
    refetch,
    addFormMutation,
    editFormMutation
  } = props;

  if (brandsQuery.loading || formsQuery.loading) {
    return <Spinner />;
  }

  const brands = brandsQuery.brands;
  const forms = formsQuery.forms;

  const loadTypes = Object.values(FORM_LOAD_TYPES);
  loadTypes.splice(-1, 1);

  const successActions = Object.values(FORM_SUCCESS_ACTIONS);
  successActions.splice(-1, 1);

  const updatedProps = {
    ...props,
    brands,
    forms,
    save: doc =>
      save(doc, addFormMutation, editFormMutation, integration, refetch),
    loadTypes,
    successActions
  };

  return <Form {...updatedProps} />;
};

FormContainer.propTypes = {
  integration: PropTypes.object,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  addFormMutation: PropTypes.func,
  editFormMutation: PropTypes.func,
  refetch: PropTypes.func
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
        fetchPolicy: 'network-only'
      })
    }
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
        fetchPolicy: 'network-only'
      })
    }
  )
)(FormContainer);
