import gql from 'graphql-tag';
import { FieldsCombinedByTypeQueryResponse } from 'modules/settings/properties/types';
import {
  mutations as tagMutations,
  queries as tagQueries
} from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import { CountQueryResponse } from '../../customers/types';
import {
  AddMutationResponse,
  MutationVariables,
  TagsQueryResponse
} from '../../tags/types';
import { TagStep } from '../components';
import { queries } from '../graphql';
import { TagCountQueryResponse } from '../types';

type Props = {};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  tagsCountsQuery: CountQueryResponse;
  tagsFields: FieldsCombinedByTypeQueryResponse;
} & Props &
  AddMutationResponse;

const TagStepContainer = (props: FinalProps) => {
  const { tagsQuery, tagsCountsQuery, tagsFields, tagsAdd } = props;

  const tagsCounts = tagsCountsQuery.customerCounts || {
    byTag: {}
  };

  /*
  const tagFields = tagsFields.fieldsCombinedByContentType
    ? tagsFields.fieldsCombinedByContentType.map(
        ({ name, label}) => ({
          _id: name,
          title: label,
          selectedBy: "none"
        })
      )
    : [];
  */
  const tagAdd = ({ doc }) => {
    tagsAdd({ variables: { ...doc } }).then(() => {
      tagsQuery.refetch();
      tagsCountsQuery.refetch();
      Alert.success('Success');
    });
  };

  const updatedProps = {
    ...props,
    tagsAdd,
    tags: tagsQuery.tags || [],
    tagCounts: tagsCounts.byTag || {}
  };

  return <TagStep {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse>(gql(queries.tags), {
      name: 'tagsQuery'
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'tagsCountsQuery',
        options: {
          variables: {
            only: 'byTag'
          }
        }
      }
    ),
    graphql<Props, AddMutationResponse, MutationVariables>(
      gql(tagMutations.add),
      { name: 'tagsAdd' }
    )
  )(TagStepContainer)
);
