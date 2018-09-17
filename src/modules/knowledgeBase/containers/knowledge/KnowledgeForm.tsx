import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { KnowledgeForm } from '../../components';
import { queries } from '../../graphql';
import { ITopic } from '../../types';

type Props = {
  getBrandListQuery: any,
  save: () => void,
  topic: ITopic
};

const TopicAddFormContainer = ({ topic, getBrandListQuery, ...props }: Props) => {
  if (getBrandListQuery.loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,
    topic,
    brands: getBrandListQuery.brands || []
  };
  return <KnowledgeForm {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.getBrandList), {
    name: 'getBrandListQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  })
)(TopicAddFormContainer);
