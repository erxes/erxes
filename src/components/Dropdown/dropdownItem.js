import React, {Component} from 'react';
import styled from "styled-components"
import {colors} from "../../styles";
import PropTypes from "prop-types";

const Styles = styled.span `
  padding:5px 20px;
  display:flex;
  align-items:center;
  &:hover{
    background:${colors.borderPrimary};
  }
  font-size:0.875em;
  color:${colors.colorCoreLightGray};
`

export default class DropdownItem extends Component {

  handleClick() {
    this.context.component.handleMenuItemClick(this.props.command, this);
  }

  render() {
    const style = this.props.divider
      ? {
        borderTop: `1px solid ${colors.borderPrimary}`,
        padding: `5px 0`,
        marginTop: `5px`
      }
      : null;

    return (
      <div style={style}>
        <Styles onClick={this.handleClick.bind(this)}>
          {this.props.children}
        </Styles>
      </div>
    );
  }

}

DropdownItem.contextTypes = {
  component:PropTypes.any
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  divider: PropTypes.bool,
  hover: PropTypes.bool,
  command:PropTypes.string
};

DropdownItem.defaultProps = {
  divider: false,
  hover: true
};
