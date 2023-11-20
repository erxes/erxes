import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  ITag,
  ITagTypes,
  TagMutationResponse,
  TagMutationVariables,
  TagsQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';

import React from 'react';
import Tagger from '../components/Tagger';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  type: ITagTypes | string;
  successCallback?: () => void;
  className?: string;
  refetchQueries?: any[];
  parentTagId?: string;
  perPage?: number;
  singleSelect?: boolean;
  disableTreeView?: boolean;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  tagsCountQuery: any;
} & Props &
  TagMutationResponse;

const TaggerContainer = (props: FinalProps) => {
  const {
    type,
    targets = [],
    successCallback,
    tagsQuery,
    tagsCountQuery,
    tagMutation
  } = props;

  const tags = tagsQuery.tags || [];
  const totalCount = tagsCountQuery.tagsQueryCount || 0;

  const tag = selectedTagIds => {
    const variables = {
      type,
      targetIds: targets.map(t => t._id),
      tagIds: selectedTagIds
    };

    tagMutation({ variables })
      .then(() => {
        let message = `The ${type} has been tagged!`;

        if (targets.length > 1) {
          message = `Selected ${type}s have been tagged!`;
        }

        Alert.success(message);

        if (successCallback) {
          successCallback();
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const onLoadMore = (page: number) => {
    return (
      tagsQuery &&
      tagsQuery.fetchMore({
        variables: {
          perPage: 20,
          page
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.tags.length === 0) {
            return prevResult;
          }

          const prevTags = prevResult.tags || [];
          const prevTagsIds = prevTags.map((t: ITag) => t._id);

          const fetchedTags: ITag[] = [];

          for (const t of fetchMoreResult.tags) {
            if (!prevTagsIds.includes(t._id)) {
              fetchedTags.push(t);
            }
          }

          return {
            ...prevResult,
            tags: [...prevTags, ...fetchedTags]
          };
        }
      })
    );
  };

  const updatedProps = {
    ...props,
    loading: tagsQuery.loading,
    tags,
    totalCount,
    onLoadMore,
    tag
  };

  return <Tagger {...updatedProps} />;
};

const query = gql`
  query(
    $type: String!
    $tagIds: [String]
    $parentId: String
    $page: Int
    $perPage: Int
  ) {
    tags(
      type: $type
      tagIds: $tagIds
      parentId: $parentId
      page: $page
      perPage: $perPage
    ) {
      _id
      name
      colorCode
      parentId
    }
  }
`;

export default withProps<Props>(
  compose(
    graphql<Props, any, { type: string }>(gql(queries.tagsQueryCount), {
      name: 'tagsCountQuery',
      options: (props: Props) => ({
        variables: {
          type: props.type,
          parentId: props.parentTagId
        }
      })
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(query, {
      name: 'tagsQuery',
      options: (props: Props) => ({
        variables: {
          type: props.type,
          parentId: props.parentTagId,
          perPage: props.perPage || 20
        }
      })
    }),
    graphql<Props, TagMutationResponse, TagMutationVariables>(
      gql(mutations.tagsTag),
      {
        name: 'tagMutation',
        options: ({ refetchQueries }) => ({
          refetchQueries
        })
      }
    )
  )(TaggerContainer)
);
