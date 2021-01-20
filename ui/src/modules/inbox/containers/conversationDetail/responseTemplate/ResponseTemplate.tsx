import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import ResponseTemplate from 'modules/inbox/components/conversationDetail/workarea/responseTemplate/ResponseTemplate';
import { queries } from 'modules/inbox/graphql';
import { queries as brandQuery } from 'modules/settings/brands/graphql';
import { BrandsQueryResponse } from 'modules/settings/brands/types';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse
} from 'modules/settings/responseTemplates/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brandId?: string;
  attachments: any[];
  content: string;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
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
    brands: brandsQuery.brands
  };

  return <ResponseTemplate {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(brandQuery.brands), {
      name: 'brandsQuery'
    }),
    graphql(gql(queries.responseTemplateList), {
      name: 'responseTemplatesQuery'
    })
  )(ResponseTemplateContainer)
);
