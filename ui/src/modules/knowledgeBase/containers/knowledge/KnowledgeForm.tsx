import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { queries } from 'modules/settings/brands/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { BrandsQueryResponse } from '../../../settings/brands/types';
import KnowledgeForm from '../../components/knowledge/KnowledgeForm';
import { ITopic } from '../../types';

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
