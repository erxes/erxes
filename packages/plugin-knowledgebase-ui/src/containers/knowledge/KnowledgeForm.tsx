import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { queries as brandQueries } from '@erxes/ui/src/brands/graphql';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';

type Props = {
  topic: ITopic;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type FinalProps = {
  getBrandListQuery: BrandsQueryResponse;
  segmentsQuery?: any;
} & Props;

const TopicAddFormContainer = ({
  topic,
  getBrandListQuery,
  segmentsQuery,
  ...props
}: FinalProps) => {
  if (getBrandListQuery.loading) {
    return <Spinner objective={true} />;
  }

  const segments = segmentsQuery ? segmentsQuery.segments || [] : [];

  const updatedProps = {
    ...props,
    topic,
    segments,
    brands: getBrandListQuery.brands || []
  };

  return <KnowledgeForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(brandQueries.brands), {
      name: 'getBrandListQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql(
      gql(
        'query segments($contentTypes: [String]!) { segments(contentTypes: $contentTypes) { _id, name }}'
      ),
      {
        name: 'segmentsQuery',
        options: () => ({
          variables: {
            contentTypes: ['core:user']
          }
        }),
        skip: !isEnabled('segments')
      }
    )
  )(TopicAddFormContainer)
);
