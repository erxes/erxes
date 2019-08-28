import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import {
  AddFieldsMutationResponse,
  AddFieldsMutationVariables
} from 'modules/settings/properties/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import Form from '../components/Form';
import { mutations } from '../graphql';
import {
  AddFormMutationResponse,
  AddFormMutationVariables,
  IFormPreviewContent
} from '../types';

type Props = {
  previewContent: (props: IFormPreviewContent) => void;
  onChange: (doc: any) => void;
  isSaving: boolean;
};

type FinalProps = {} & Props &
  IRouterProps &
  AddFieldsMutationResponse &
  AddFormMutationResponse;

class CreateFormContainer extends React.Component<FinalProps> {
  render() {
    const { addFormMutation, addFieldsMutation, onChange } = this.props;

    const saveForm = doc => {
      let formId;
      const { title, description, buttonText, fields, type } = doc;

      addFormMutation({
        variables: {
          title,
          description,
          buttonText,
          type
        }
      })
        .then(({ data }) => {
          formId = data.formsAdd._id;

          onChange({ ...doc, formId });
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
        name: 'addFormMutation'
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
