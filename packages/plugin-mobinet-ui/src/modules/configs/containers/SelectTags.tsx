import React from 'react';
import gql from 'graphql-tag';
import { useLazyQuery, useQuery } from 'react-apollo';
import SelectTags from '../components/SelectTags';

const TAGS_QUERY = gql`
  query Tags($type: String, $searchValue: String, $tagIds: [String]) {
    tags(type: $type, searchValue: $searchValue, tagIds: $tagIds) {
      _id
      name
    }
  }
`;

const Container = ({ onChange, value, type }) => {
  const [getTags, { data, loading }] = useLazyQuery(TAGS_QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      type,
      searchValue: ''
    }
  });

  const tagsQuery = useQuery(TAGS_QUERY, {
    variables: {
      type,
      searchValue: ''
    }
  });

  const onSearch = (searchValue: string) => {
    getTags({
      variables: {
        searchValue,
        type
      }
    });
  };

  const tags = (data && data.tags) || [];
  const allTags = (tagsQuery.data && tagsQuery.data.tags) || [];

  return (
    <SelectTags
      allTags={allTags}
      filtered={tags}
      value={value}
      loading={loading}
      onSearch={onSearch}
      onChange={onChange}
    />
  );
};

export default Container;
