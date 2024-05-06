import { isEnabled } from '@erxes/ui/src/utils/core';
import { gql, useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { queries as brandQueries } from '@erxes/ui/src/brands/graphql';
import React from 'react';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';
import { ITopic } from '@erxes/ui-knowledgebase/src/types';
import { queries } from '@erxes/ui-knowledgebase/src/graphql';

type Props = {
  topic: ITopic;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

const TopicAddFormContainer = ({ topic, ...props }: Props) => {
  const getBrandListQuery = useQuery<BrandsQueryResponse>(
    gql(brandQueries.brands),
    {
      fetchPolicy: 'network-only',
    },
  );

  const getSegmentListQuery = useQuery<any>(gql(queries.getSegmentList), {
    variables: {
      contentTypes: ['core:user'],
    },
    skip: !isEnabled('segments'),
  });

  if (getBrandListQuery.loading || getSegmentListQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    topic,
    segments: getSegmentListQuery?.data?.segments || [],
    brands: getBrandListQuery?.data?.brands || [],
  };

  return <KnowledgeForm {...updatedProps} />;
};

export default TopicAddFormContainer;
