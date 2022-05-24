import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IActivityLogItemProps } from '@erxes/ui-logs/src/activityLogs/types';
import TaggedLog from '../component/TaggedLog';
import { TagsQueryResponse } from '../../types';
import { queries } from '../../graphql';

type Props = {
  tagIds: string[];
  activity: IActivityLogItemProps;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
} & Props;

const TaggedLogContainer = (props: FinalProps) => {
  const { tagsQuery } = props;

  if (tagsQuery.loading) {
    return <Spinner />;
  }

  const tags = tagsQuery.tags;

  console.log(tags);

  return <TaggedLog tags={tags} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse, { tagIds: string[] }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: ({ tagIds }) => ({
        variables: { tagIds },
        fetchPolicy: 'network-only'
      })
    })
  )(TaggedLogContainer)
);
