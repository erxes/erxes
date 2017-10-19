import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const TheadStyled = styled.thead``;
const ThStyled = styled.th`
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
`;

function Thead({ children }) {
  return (
    <TheadStyled>
      {children}
    </TheadStyled>
  );
}
function ThCell({ children }) {
  return (
    <ThStyled>{children}</ThStyled>
  );
}
Thead.propTypes = {
  children: PropTypes.node,
};
ThCell.propTypes = {
  children: PropTypes.node,
}

export default Thead;
export { ThCell };
