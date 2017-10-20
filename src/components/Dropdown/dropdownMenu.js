import React, {Component} from 'react';
import styled from "styled-components"
import {colors} from "../../styles";
import PropTypes from "prop-types";

const Styles = styled.div `
  padding:5px 0;
  border:1px solid ${colors.borderPrimary};
  background:#fff;
  box-shadow:0 2px 4px 0 ${colors.borderPrimary};
  position:absolute;
  top:100%;
`

export default class DropdownMenu extends Component {
  render() {
    const style = this.props.align == 'start'
      ? {
        left: 0,
        minWidth: `${this.props.width}`
      }
      : {
        right: 0,
        minWidth: `${this.props.width}`
      }

    return (
      <Styles style={style}>
        {this.props.children}
      </Styles>
    );
  }

}

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['start', 'end']),
  width: PropTypes.string
};

DropdownMenu.defaultProps = {
  align: 'start',
  width: "300px"
};
