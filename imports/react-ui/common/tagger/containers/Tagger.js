import { gql, graphql } from 'react-apollo';
import { Meteor } from 'meteor/meteor';
import Tagger from '../components/Tagger';

const TagsQuery = gql`
  query GetTags($type: String!) {
    tags(type: $type) {
      _id
      name
      colorCode
    }
  }
`;

const TaggerWithData = graphql(TagsQuery, {
  options: props => ({
    variables: { type: props.type },
  }),
  props: ({ data: { loading, tags } }) => ({
    loading,
    tags,

    tag({ type, targetIds, tagIds }, callback) {
      return Meteor.call('tags.tag', { type, targetIds, tagIds }, callback);
    },
  }),
})(Tagger);

export default TaggerWithData;
