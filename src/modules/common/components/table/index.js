import React from 'react';
import PropTypes from 'prop-types';
import StyledTable from './styles';

const propTypes = {
  children: PropTypes.node,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  condensed: PropTypes.bool,
  hover: PropTypes.bool,
  responsive: PropTypes.bool,
  whiteSpace: PropTypes.string
};

const defaultProps = {
  required: false,
  striped: false,
  bordered: false,
  condensed: false,
  hover: false,
  responsive: false
};

class Table extends React.Component {
  render() {
    const props = this.props;

    return <StyledTable {...props} />;
  }
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;
