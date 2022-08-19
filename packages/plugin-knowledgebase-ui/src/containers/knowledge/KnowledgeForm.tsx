import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { queries } from '@erxes/ui/src/brands/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';
import { ITopic } from '@erxes/ui-knowledgeBase/src/types';

type Props = {
  topic: ITopic;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type FinalProps = { getBrandListQuery: BrandsQueryResponse } & Props;

const TopicAddFormContainer = ({
  topic,
  getBrandListQuery,
  ...props
}: FinalProps) => {
  if (getBrandListQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    topic,
    brands: getBrandListQuery.brands || []
  };
  return <KnowledgeForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'getBrandListQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(TopicAddFormContainer)
);
