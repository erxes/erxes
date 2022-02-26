import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { ConfigsQueryResponse } from 'modules/settings/general/types';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations } from '../graphql';
import { queries } from 'modules/settings/general/graphql';
import {
  AddFormMutationResponse,
  AddFormMutationVariables,
  BulkEditAndAddMutationVariables,
  FieldsBulkAddAndEditMutationResponse,
  IFormData
} from '../types';
import { Spinner } from 'erxes-ui';

type Props = {
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  formData?: IFormData;
  type: string;
  isReadyToSave: boolean;
  showMessage?: boolean;
  currentMode?: 'create' | 'update' | undefined;
  currentField?: IField;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
} & Props &
  IRouterProps &
  AddFormMutationResponse &
  FieldsBulkAddAndEditMutationResponse;

class CreateFormContainer extends React.Component<FinalProps, {}> {
  static defaultProps = {
    showMessage: true
  };

  render() {
    const {
      addFormMutation,
      afterDbSave,
      fieldsBulkAddAndEditMutation,
      showMessage,
      configsQuery
    } = this.props;

    if (configsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const saveForm = doc => {
      let formId;
      const {
        title,
        desc,
        buttonText,
        fields,
        type,
        numberOfPages,
        googleMapApiKey
      } = doc;

      addFormMutation({
        variables: {
          title,
          description: desc,
          buttonText,
          type,
          numberOfPages: Number(numberOfPages),
          googleMapApiKey
        }
      })
        .then(({ data }) => {
          formId = data.formsAdd._id;

          afterDbSave(formId);
        })

        .then(() => {
          fields.forEach(f => {
            delete f.contentType;
            delete f.__typename;
          });

          fieldsBulkAddAndEditMutation({
            variables: {
              contentType: 'form',
              contentTypeId: formId,
              addingFields: fields.map(({ _id, ...rest }) => ({
                tempFieldId: _id,
                ...rest
              }))
            }
          });
        })

        .then(() => {
          if (showMessage) {
            Alert.success('You successfully added a form');
          }
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      fields: [],
      configs: configsQuery.configs || [],
      saveForm
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, AddFormMutationResponse, AddFormMutationVariables>(
      gql(mutations.addForm),
      {
        name: 'addFormMutation',
        options: {
          refetchQueries: ['fields']
        }
      }
    ),
    graphql<{}, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery'
    }),
    graphql<
      Props,
      FieldsBulkAddAndEditMutationResponse,
      BulkEditAndAddMutationVariables
    >(gql(mutations.fieldsBulkAddAndEdit), {
      name: 'fieldsBulkAddAndEditMutation'
    })
  )(withRouter<FinalProps>(CreateFormContainer))
);
