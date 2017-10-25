import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const TableStyled = styled.table`
  display: table;
  padding: 0;
  border-collapse: collapse;
  width: 100%;
  text-size-adjust: 100%;
  text-align: left;
  tr {
    display: table-row;
    vertical-align: middle;
    &:hover td {
      background-color: ${props =>
        props.hover ? '#ffd' : 'transparent'}; !important
    }
    &:nth-child(even) {
      background-color: ${props => (props.striped ? '#fafafa' : 'transparent')};
    }
  }
  td {
    padding: 16px 12px 12px 16px;
    display: table-cell;
    vertical-align: middle;
    border-bottom: 1px solid rgb(229, 229, 229);
    font-size: 15px;
  }
  thead {
    th {
      padding: 5px;
      display: table-cell;
      vertical-align: bottom;
      border-bottom: 1px solid rgb(229, 229, 229);
      font-weight: bold;
      text-rendering: optimizeLegibility;
      font-size: 12px;
      padding: 16px 12px 12px 16px;
      text-transform: uppercase;
      color: rgb(153, 153, 153);

      &:hover {
        background-color: transparent;
        cursor: pointer;
      }
      &:nth-child(even) {
        background-color: transparent;
      }
  }
  }
  tfoot {
       th {
         padding: 5px;
         display: table-cell;
         vertical-align: bottom;
         border-bottom: 1px solid rgb(229, 229, 229);
         font-size: 12px;
         padding: 16px 12px 12px 16px;
         text-transform: uppercase;
         font-style: italic;
         font-weight: normal;
         color: rgb(153, 153, 153);
         &:nth-child(even) {
           background-color: transparent;
         }
       }
  }
`;

export default class Table extends React.Component {
  render() {
    return (
      <TableStyled striped={this.props.striped} hover={this.props.hover}>
        {this.props.children}
      </TableStyled>
    );
  }
}

Table.propTypes = {
  children: PropTypes.node,
  striped: PropTypes.bool,
  hover: PropTypes.bool
};
Table.defaultProps = {
  hover: false,
  striped: false
};
