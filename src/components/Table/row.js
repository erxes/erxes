import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { connect } from "react-redux";

const RowStyled = styled.tr`
  display: table-row;
  vertical-align: middle;
  &:hover td {
    background-color: ${props =>
      props.hover ? "#ffd" : "transparent"}; !important
  }
  &:nth-child(even) {
    background-color: ${props => (props.striped ? "#fafafa" : "transparent")};
  }
`;

function Row({ children, hover, striped }) {
  return (
    <RowStyled hover={hover} striped={striped}>
      {children}
    </RowStyled>
  );
}

Row.propTypes = {
  children: PropTypes.node,
  hover: PropTypes.bool,
  striped: PropTypes.bool
};

const mapStateToProps = state => {
  return {
    hover: state.hover,
    striped: state.striped
  };
};

export default connect(mapStateToProps)(Row);
