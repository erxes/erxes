import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { IFormData } from 'modules/settings/integrations/types';
import { IField } from 'modules/settings/properties/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { Form } from '../components';
import { mutations, queries } from '../graphql';
import { ICallout } from '../types';

type Doc = {
  title: string;
  description: string;
  buttonText: string;
  themeColor: string;
  callout: ICallout;
};

interface IProps extends IRouterProps {
  brandsQuery: any;
  addIntegrationMutation: (
    params: {
      variables: {
        formData: IFormData;
        brandId: string;
        name: string;
        languageCode: string;
        formId: string;
      };
    }
  ) => Promise<void>;
  addFormMutation: (params: { variables: Doc }) => Promise<any>;
  addFieldsMutation: (
    params: {
      variables: { contentType: string; contentTypeId: string; field: IField };
    }
  ) => void;
}

class CreateFormContainer extends React.Component<IProps, {}> {
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
      let formId;

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
          const promises: any[] = [];

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
      fields: [],
      save
    };

    return <Form {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationsCreateFormIntegration), {
    name: 'addIntegrationMutation',
    options: {
      refetchQueries: ['formIntegrations', 'formIntegrationCounts']
    }
  }),
  graphql(gql(mutations.addForm), {
    name: 'addFormMutation'
  }),
  graphql(gql(mutations.fieldsAdd), {
    name: 'addFieldsMutation'
  })
)(withRouter<IProps>(CreateFormContainer));
