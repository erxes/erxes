import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

const ChipText = props => {
  const { query } = props;

  if (query.loading) {
    return '-';
  }

  const brand = query.brandDetail;
  const channel = query.channelDetail;
  const tag = query.tagDetail;

  return (
    (brand && brand.name) || (channel && channel.name) || (tag && tag.name)
  );
};

ChipText.propTypes = {
  query: PropTypes.object
};

const createChipText = (query, id) => {
  return graphql(query, {
    name: 'query',
    options: () => {
      return {
        variables: {
          id
        }
      };
    }
  })(ChipText);
};

export default createChipText;
