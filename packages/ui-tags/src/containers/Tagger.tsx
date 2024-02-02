import { Alert } from '@erxes/ui/src/utils';
import {
  ITag,
  ITagTypes,
  TagsQueryResponse,
  TagMutationResponse,
} from '../types';
import { mutations, queries } from '../graphql';

import React from 'react';
import Tagger from '../components/Tagger';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';

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

const TaggerContainer = (props: Props) => {
  const tagsQuery = useQuery<TagsQueryResponse>(query, {
    variables: {
      type: props.type,
      parentId: props.parentTagId,
      perPage: props.perPage || 20,
    },
  });

  const tagsCountQuery = useQuery(gql(queries.tagsQueryCount), {
    variables: {
      type: props.type,
      parentId: props.parentTagId,
    },
  });

  const [tagMutation] = useMutation<TagMutationResponse>(
    gql(mutations.tagsTag),
    {
      refetchQueries: props.refetchQueries,
    },
  );

  const { type, targets = [], successCallback } = props;

  const tags = (tagsQuery.data && tagsQuery.data.tags) || [];
  const totalCount =
    (tagsCountQuery.data && tagsCountQuery.data.tagsQueryCount) || 0;

  const tag = (selectedTagIds) => {
    const variables = {
      type,
      targetIds: targets.map((t) => t._id),
      tagIds: selectedTagIds,
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
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const onLoadMore = (page: number) => {
    return (
      tagsQuery &&
      tagsQuery.fetchMore({
        variables: {
          perPage: props.perPage || 20,
          page,
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
            tags: [...prevTags, ...fetchedTags],
          };
        },
      })
    );
  };

  const updatedProps = {
    ...props,
    loading: tagsQuery.loading,
    tags,
    totalCount,
    onLoadMore,
    tag,
  };

  return <Tagger {...updatedProps} />;
};

const query = gql`
  query (
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

export default TaggerContainer;
