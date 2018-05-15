import React from 'react';
import PropTypes from 'prop-types';

function UnreadCount({ count }) {
  if (!count) {
    return null;
  }

  return <span>{count}</span>;
}

UnreadCount.propTypes = {
  count: PropTypes.number,
};

export default UnreadCount;
