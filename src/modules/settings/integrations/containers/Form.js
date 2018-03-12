import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Form } from '../components';
import { FORM_LOAD_TYPES, FORM_SUCCESS_ACTIONS } from '../constants';
import { save } from './utils';

const FormContainer = props => {
  const {
    history,
    brandsQuery,
    formsQuery,
    integration,
    refetch,
    addMutation,
    editMutation
  } = props;

  if (brandsQuery.loading || formsQuery.loading) {
    return <Spinner objective />;
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

    save: variables =>
      save({
        history,
        variables,
        addMutation,
        editMutation,
        integration,
        refetch
      }),

    loadTypes,
    successActions
  };

  return <Form {...updatedProps} />;
};

FormContainer.propTypes = {
  history: PropTypes.object,
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
  $languageCode: String,
  $formData: IntegrationFormData!
`;

const commonParams = `
  name: $name,
  brandId: $brandId,
  formId: $formId,
  languageCode: $languageCode,
  formData: $formData
`;

export default withRouter(
  compose(
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
  )(FormContainer)
);
