import React from 'react';
import PropTypes from 'prop-types';
import { Spinner, EmptyState } from 'modules/common/components';

const propTypes = {
  data: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  emptyText: PropTypes.string,
  emptyIcon: PropTypes.string,
  size: PropTypes.string
};

class ShowData extends React.Component {
  showData() {
    const { loading, count, data, emptyIcon, emptyText, size } = this.props;

    if (loading) {
      return <Spinner />;
    } else if (count === 0) {
      return <EmptyState text={emptyText} size={size} icon={emptyIcon} />;
    }
    return data;
  }

  render() {
    return this.showData();
  }
}

ShowData.propTypes = propTypes;

ShowData.defaultProps = {
  emptyText: 'There is no data',
  emptyIcon: null,
  size: 'full'
};

export default ShowData;
