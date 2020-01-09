import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddFieldsMutationResponse,
  AddFieldsMutationVariables,
  IField
} from 'modules/settings/properties/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations } from '../graphql';
import {
  AddFormMutationResponse,
  AddFormMutationVariables,
  IFormData
} from '../types';

type Props = {
  renderPreviewWrapper: (previewRenderer, fields: IField[]) => void;
  afterDbSave: (formId: string) => void;
  onDocChange?: (doc: IFormData) => void;
  type: string;
  isReadyToSave: boolean;
  showMessage?: boolean;
};

type FinalProps = {} & Props &
  IRouterProps &
  AddFieldsMutationResponse &
  AddFormMutationResponse;

class CreateFormContainer extends React.Component<FinalProps, {}> {
  static defaultProps = {
    showMessage: true
  };

  render() {
    const {
      addFormMutation,
      addFieldsMutation,
      afterDbSave,
      showMessage
    } = this.props;

    const saveForm = doc => {
      let formId;
      const { title, desc, btnText, fields, type } = doc;

      addFormMutation({
        variables: {
          title,
          description: desc,
          buttonText: btnText,
          type
        }
      })
        .then(({ data }) => {
          formId = data.formsAdd._id;

          afterDbSave(formId);
        })

        .then(() => {
          const promises: any[] = [];

          for (const field of fields) {
            promises.push(
              addFieldsMutation({
                variables: {
                  contentTypeId: formId,
                  ...field
                }
              })
            );
          }

          return Promise.all(promises);
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
    graphql<Props, AddFieldsMutationResponse, AddFieldsMutationVariables>(
      gql(mutations.fieldsAdd),
      {
        name: 'addFieldsMutation'
      }
    )
  )(withRouter<FinalProps>(CreateFormContainer))
);
