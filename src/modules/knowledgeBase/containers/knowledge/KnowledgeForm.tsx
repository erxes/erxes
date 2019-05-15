import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries } from 'modules/settings/brands/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { BrandsQueryResponse } from '../../../settings/brands/types';
import { KnowledgeForm } from '../../components';
import { ITopic } from '../../types';

type Props = {
  topic: ITopic;
  save: (
    params: {
      doc: {
        doc: {
          title: string;
          description: string;
          brandId: string;
          languageCode: string;
          color: string;
        };
      };
    },
    callback: () => void,
    object: any
  ) => void;
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
