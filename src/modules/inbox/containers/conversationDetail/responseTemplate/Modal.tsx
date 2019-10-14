import gql from 'graphql-tag';
import { IAttachment } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import Modal from 'modules/inbox/components/conversationDetail/workarea/responseTemplate/Modal';
import { mutations, queries } from 'modules/inbox/graphql';
import { IBrand } from 'modules/settings/brands/types';
import {
  SaveResponseTemplateMutationResponse,
  SaveResponsTemplateMutationVariables
} from 'modules/settings/responseTemplates/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  brands: IBrand[];
  trigger: React.ReactNode;
  brandId?: string;
  files?: IAttachment[];
  content?: string;
};

type FinalProps = Props & SaveResponseTemplateMutationResponse;

const ModalContainer = (props: FinalProps) => {
  const { saveResponseTemplateMutation } = props;

  const saveResponseTemplate = (
    variables: SaveResponsTemplateMutationVariables,
    callback: (e?: Error) => void
  ) => {
    saveResponseTemplateMutation({ variables })
      .then(() => {
        Alert.success('You successfully saved a response template');
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    saveResponseTemplate
  };

  return <Modal {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      SaveResponseTemplateMutationResponse,
      SaveResponsTemplateMutationVariables
    >(gql(mutations.saveResponseTemplate), {
      name: 'saveResponseTemplateMutation',
      options: {
        refetchQueries: [
          {
            query: gql`
              ${queries.responseTemplateList}
            `
          }
        ]
      }
    })
  )(ModalContainer)
);
