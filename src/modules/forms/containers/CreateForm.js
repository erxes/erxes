import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withRouter } from 'react-router';
import { Alert } from 'modules/common/utils';
import { Form } from '../components';
import { queries, mutations } from '../graphql';

class CreateFormContainer extends Component {
  render() {
    const {
      brandsQuery,
      addIntegrationMutation,
      addFormMutation,
      addFieldsMutation,
      history
    } = this.props;

    if (brandsQuery.loading) {
      return false;
    }

    const brands = brandsQuery.brands || [];

    const save = doc => {
      let formId = '';

      const { form, brandId, name, languageCode, formData, fields } = doc;

      addFormMutation({
        variables: form
      })
        .then(({ data }) => {
          formId = data.formsAdd._id;

          return addIntegrationMutation({
            variables: { formData, brandId, name, languageCode, formId }
          });
        })

        .then(() => {
          const promises = [];

          for (const field of fields) {
            promises.push(
              addFieldsMutation({
                variables: {
                  contentType: 'form',
                  contentTypeId: formId,
                  ...field
                }
              })
            );
          }

          return Promise.all(promises);
        })

        .then(() => {
          Alert.success('Congrats');
          history.push('/forms');
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      brands,
      save
    };

    return <Form {...updatedProps} />;
  }
}

CreateFormContainer.propTypes = {
  brandsQuery: PropTypes.object,
  addIntegrationMutation: PropTypes.func,
  addFormMutation: PropTypes.func,
  addFieldsMutation: PropTypes.func,
  location: PropTypes.object,
  history: PropTypes.object
};

const CreateFormWithData = compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    fetchPolicy: 'network-only'
  }),
  graphql(gql(mutations.integrationsCreateFormIntegration), {
    name: 'addIntegrationMutation',
    options: props => ({
      refetchQueries: ['formIntegrations', 'formIntegrationCounts']
    })
  }),
  graphql(gql(mutations.addForm), {
    name: 'addFormMutation'
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'addFieldsMutation'
  })
)(CreateFormContainer);

export default withRouter(CreateFormWithData);
