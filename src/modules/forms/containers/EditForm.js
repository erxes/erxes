import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { Alert } from 'modules/common/utils';
import { Bulk } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { Form } from '../components';

class EditFormContainer extends Bulk {
  render() {
    const {
      brandsQuery,
      formsQuery,
      integrationDetailQuery,
      contentTypeId,
      editMutation,
      fieldsQuery,
      history
    } = this.props;

    if (
      fieldsQuery.loading ||
      brandsQuery.loading ||
      integrationDetailQuery.loading
    ) {
      return false;
    }

    const brands = brandsQuery.brands || [];
    const forms = formsQuery.forms || [];
    const fields = [];
    const integration = integrationDetailQuery.integrationDetail || {};

    // cloning graphql results, because in component we need to change
    // each field's attributes and it is immutable. so making it mutable
    fieldsQuery.fields.forEach(field => {
      fields.push({ ...field });
    });

    const doMutation = (mutation, variables) => {
      mutation({
        variables
      })
        .then(() => {
          Alert.success('Congrats');
          history.push('/forms');
        })
        .catch(error => {
          Alert.error(error.message);
          console.log(error.message);
        });
    };

    // save
    const save = doc => {
      return doMutation(editMutation, { ...doc, _id: contentTypeId });
    };

    const updatedProps = {
      ...this.props,
      brands,
      forms,
      integration,
      fields,
      save
    };

    return <Form {...updatedProps} />;
  }
}

EditFormContainer.propTypes = {
  contentTypeId: PropTypes.string,
  fieldsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  formsQuery: PropTypes.object,
  integrationDetailQuery: PropTypes.object,
  editMutation: PropTypes.func
};

const EditFormWithData = compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.fields), {
    name: 'fieldsQuery',
    options: ({ formId }) => {
      return {
        variables: {
          contentType: 'form',
          contentTypeId: formId
        }
      };
    }
  }),
  graphql(gql(queries.forms), {
    name: 'formsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationDetail), {
    name: 'integrationDetailQuery',
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationsEditFormIntegration), {
    name: 'editMutation'
  })
)(EditFormContainer);

const EditFormIntegrationContainer = props => {
  const queryParams = queryString.parse(props.location.search);

  const extendedProps = { ...props, queryParams };
  return <EditFormWithData {...extendedProps} />;
};

EditFormIntegrationContainer.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object
};

export default withRouter(EditFormIntegrationContainer);
