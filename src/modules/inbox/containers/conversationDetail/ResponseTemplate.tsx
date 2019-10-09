import gql from 'graphql-tag';
import ResponseTemplate from 'modules/inbox/components/conversationDetail/workarea/ResponseTemplate';
import { mutations, queries } from 'modules/inbox/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { AllBrandsQueryResponse } from '../../../settings/brands/types';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse,
  SaveResponsTemplateMutationVariables
} from '../../../settings/responseTemplates/types';

type Props = {
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brandId?: string;
  attachments: any[];
  content: string;
};

type FinalProps = {
  brandsQuery: AllBrandsQueryResponse;
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
} & Props &
  SaveResponseTemplateMutationResponse;

const ResponseTemplateContainer = (props: FinalProps) => {
  const {
    brandsQuery,
    responseTemplatesQuery,
    saveResponseTemplateMutation
  } = props;

  if (responseTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const saveResponseTemplate = (
    variables: SaveResponsTemplateMutationVariables,
    callback: (e?: Error) => void
  ) => {
    saveResponseTemplateMutation({ variables })
      .then(() => {
        responseTemplatesQuery.refetch();
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    brands: brandsQuery.allBrands,
    saveResponseTemplate,
    responseTemplates: responseTemplatesQuery.responseTemplates
  };

  return <ResponseTemplate {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AllBrandsQueryResponse>(gql(queries.brandList), {
      name: 'brandsQuery'
    }),
    graphql(gql(queries.responseTemplateList), {
      name: 'responseTemplatesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
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
  )(ResponseTemplateContainer)
);
