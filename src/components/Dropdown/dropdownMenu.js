import React, {Component} from 'react';
import styled from "styled-components"
import {colors} from "../../styles";
import PropTypes from "prop-types";

const Styles = styled.div `
  padding:10px 0;
  border:1px solid ${colors.borderPrimary};
  background:#fff;
  box-shadow:0 2px 4px 0 ${colors.borderPrimary};
  position:absolute;
  top:calc(100% + 10px);
  `

export default class DropdownMenu extends Component {
  parent() {
    return this.context.component;
  }

  render() {
    const display = this.parent().state.visible
      ? 'block'
      : 'none';

    const align = this.parent().props.align == "right"
      ? {
        right: 0
      }
      : {
        left: 0
      };

    let style = {
      display: display,
      minWidth: `${this.parent().props.width}px`
    }

    style = Object.assign(align, style);

    return (
      <Styles style={style}>
        {this.props.children}
      </Styles>
    );
  }

}

DropdownMenu.contextTypes = {
  component: PropTypes.any
};

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
};
