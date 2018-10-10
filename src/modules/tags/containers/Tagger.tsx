import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Tagger } from '../components';
import { ITagTypes } from '../types';

type Props = {
  // targets can be conversation, customer, company etc ...
  targets: any[];
  type: ITagTypes;
  tagsQuery: any;

  tagMutation: (
    params: {
      variables: {
        type: string;
        targetIds: string[];
        tagIds: string[];
      };
    }
  ) => Promise<any>;

  successCallback: () => void;
};

const TaggerContainer = (props: Props) => {
  const { type, targets, successCallback, tagsQuery, tagMutation } = props;

  const tag = selectedTagIds => {
    const variables = {
      tagIds: selectedTagIds,
      targetIds: targets.map(t => t._id),
      type
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

  const updatedProps = {
    ...props,
    loading: tagsQuery.loading,
    tag,
    tags: tagsQuery.tags || []
  };

  return <Tagger {...updatedProps} />;
};

const tagsQuery = gql`
  query($type: String!) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

const tagMutation = gql`
  mutation tagsTag(
    $type: String!
    $targetIds: [String!]!
    $tagIds: [String!]!
  ) {
    tagsTag(type: $type, targetIds: $targetIds, tagIds: $tagIds)
  }
`;

export default compose(
  graphql(tagsQuery, {
    name: 'tagsQuery',
    options: (props: Props) => ({
      variables: { type: props.type }
    })
  }),
  graphql(tagMutation, {
    name: 'tagMutation',
    options: ({ refetchQueries }: { refetchQueries: any }) => ({
      refetchQueries
    })
  })
)(TaggerContainer);
