import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spinner, EmptyState } from 'modules/common/components';

const propTypes = {
  data: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  emptyText: PropTypes.string,
  emptyIcon: PropTypes.string,
  emptyImage: PropTypes.string,
  size: PropTypes.string,
  objective: PropTypes.bool
};

class DataWithLoader extends Component {
  showData() {
    const {
      loading,
      count,
      data,
      emptyIcon,
      emptyImage,
      emptyText,
      size,
      objective
    } = this.props;

    if (loading) {
      return <Spinner objective={objective} />;
    } else if (count === 0) {
      return (
        <EmptyState
          text={emptyText}
          size={size}
          icon={emptyIcon}
          image={emptyImage}
        />
      );
    }
    return data;
  }

  render() {
    return this.showData();
  }
}

DataWithLoader.propTypes = propTypes;

DataWithLoader.defaultProps = {
  emptyText: 'There is no data',
  emptyIcon: null,
  emptyImage: null,
  size: 'full',
  objective: false
};

export default DataWithLoader;
