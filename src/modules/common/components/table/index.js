import * as React from 'react';
import PropTypes from 'prop-types';
import StyledTable from './styles';

const propTypes = {
  children: PropTypes.node,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  condensed: PropTypes.bool,
  hover: PropTypes.bool,
  responsive: PropTypes.bool,
  whiteSpace: PropTypes.string,
  alignTop: PropTypes.bool
};

const defaultProps = {
  required: false,
  striped: false,
  bordered: false,
  condensed: false,
  hover: false,
  responsive: false,
  alignTop: false
};

function Table(props) {
  return <StyledTable {...props} />;
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;
