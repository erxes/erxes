import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import Tagger from '../components/Tagger';

const TaggerContainer = props => {
  const { tagsQuery, tagMutation } = props;

  const tag = ({ type, targetIds, tagIds }, callback) => {
    tagMutation({
      variables: { type, targetIds, tagIds }
    })
      .then(() => {
        callback();
      })
      .catch(error => {
        callback(error);
      });
  };

  const updatedProps = {
    loading: tagsQuery.loading,
    tags: tagsQuery.tags || [],
    tag
  };

  return <Tagger {...updatedProps} />;
};

TaggerContainer.propTypes = {
  tagsQuery: PropTypes.object,
  tagMutation: PropTypes.func
};

const tagsQuery = gql`
  query GetTags($type: String!) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

export default compose(
  graphql(tagsQuery, {
    name: 'tagsQuery',
    options: props => ({
      variables: { type: props.type }
    })
  })
)(TaggerContainer);
