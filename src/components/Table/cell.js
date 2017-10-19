import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const CellStyled = styled.td`
  padding: 16px 12px 12px 16px;
  display: table-cell;
  vertical-align: middle;
  border-bottom: 1px solid rgb(229, 229, 229);
  font-size: 15px;
`;

function Cell({ children }) {
  return <CellStyled>{children}</CellStyled>;
}

Cell.propTypes = {
  children: PropTypes.node
};

export default Cell;
