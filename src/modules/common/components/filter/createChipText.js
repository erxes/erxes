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
  const segment = query.segmentDetail;
  const form = query.formDetail;

  return (
    (brand && brand.name) ||
    (channel && channel.name) ||
    (tag && tag.name) ||
    (segment && segment.name) ||
    (form && form.title)
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
