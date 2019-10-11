import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import ResponseTemplate from 'modules/inbox/components/conversationDetail/workarea/responseTemplate/ResponseTemplate';
import { mutations, queries } from 'modules/inbox/graphql';
import { queries as brandQuery } from 'modules/settings/brands/graphql';
import { AllBrandsQueryResponse } from 'modules/settings/brands/types';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse,
  SaveResponsTemplateMutationVariables
} from 'modules/settings/responseTemplates/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

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

  if (brandsQuery.loading) {
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
    saveResponseTemplate
  };

  return <ResponseTemplate {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AllBrandsQueryResponse>(gql(brandQuery.allBrands), {
      name: 'brandsQuery'
    }),
    graphql(gql(queries.responseTemplateList), {
      name: 'responseTemplatesQuery'
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
