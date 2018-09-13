import * as React from 'react';
import StyledTable from './styles';

type Props = {
  children: React.ReactNode,
  striped: boolean,
  bordered: boolean,
  condensed: boolean,
  hover: boolean,
  responsive: boolean,
  whiteSpace: string,
  alignTop: boolean
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

function Table(props: Props) {
  return <StyledTable {...props}  />;
}

Table.defaultProps = defaultProps;

export default Table;
