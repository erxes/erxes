import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IAttachment } from '@erxes/ui/src/types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import Modal from '../../../components/conversationDetail/workarea/responseTemplate/Modal';
import { mutations, queries } from '@erxes/ui-inbox/src/inbox/graphql';
import { IBrand } from '@erxes/ui/src/brands/types';
import {
  SaveResponseTemplateMutationResponse,
  SaveResponseTemplateMutationVariables
} from '../../../../settings/responseTemplates/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

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
    variables: SaveResponseTemplateMutationVariables,
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
      SaveResponseTemplateMutationVariables
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
