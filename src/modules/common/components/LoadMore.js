import PropTypes from 'prop-types';

const propTypes = {
  perPage: PropTypes.number,
  all: PropTypes.number.isRequired,
  paramName: PropTypes.string
};

function LoadMore() {}

LoadMore.propTypes = propTypes;

export default LoadMore;
