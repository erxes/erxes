import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const TfootStyled = styled.tfoot``;
const TfStyled = styled.th`
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
`;

function Tfoot({ children }) {
  return <TfootStyled>{children}</TfootStyled>;
}
function TfCell({ children }) {
  return <TfStyled>{children}</TfStyled>;
}
Tfoot.propTypes = {
  children: PropTypes.node
};
TfCell.propTypes = {
  children: PropTypes.node
};

export default Tfoot;
export { TfCell };
