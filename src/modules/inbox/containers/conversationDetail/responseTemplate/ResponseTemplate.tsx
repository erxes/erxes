import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import ResponseTemplate from 'modules/inbox/components/conversationDetail/workarea/responseTemplate/ResponseTemplate';
import { queries } from 'modules/inbox/graphql';
import { queries as brandQuery } from 'modules/settings/brands/graphql';
import { AllBrandsQueryResponse } from 'modules/settings/brands/types';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse
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
  const { brandsQuery } = props;

  if (brandsQuery.loading) {
    return null;
  }

  const updatedProps = {
    ...props,
    brands: brandsQuery.allBrands
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
    })
  )(ResponseTemplateContainer)
);
