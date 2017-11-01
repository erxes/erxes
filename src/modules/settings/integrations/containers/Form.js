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
    addMutation,
    editMutation
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
    save: doc => save(doc, addMutation, editMutation, integration, refetch),
    loadTypes,
    successActions
  };

  return <Form {...updatedProps} />;
};

FormContainer.propTypes = {
  integration: PropTypes.object,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  refetch: PropTypes.func
};

const commonParamsDef = `
  $name: String!,
  $brandId: String!,
  $formId: String!,
  $formData: IntegrationFormData!
`;

const commonParams = `
  name: $name,
  brandId: $brandId,
  formId: $formId,
  formData: $formData
`;

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
  ),
  graphql(
    gql`
      mutation add(${commonParamsDef}) {
        integrationsCreateFormIntegration(${commonParams}) {
          _id
        }
      }
    `,
    {
      name: 'addMutation'
    }
  ),

  graphql(
    gql`
      mutation edit($_id: String!, ${commonParamsDef}) {
        integrationsEditFormIntegration(_id: $_id, ${commonParams}) {
          _id
        }
      }
    `,
    {
      name: 'editMutation'
    }
  )
)(FormContainer);
