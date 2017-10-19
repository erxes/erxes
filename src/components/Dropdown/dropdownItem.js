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
const StylesAvatar = styled.div `
  border-radius:100%;
  height:20px;
  width:20px;
  background-repeat:no-repeat;
  background-size:cover;
  background-position:center center;
  margin-right:10px;
`

export default class DropdownItem extends Component {
  render() {
    const style = this.props.divider
      ? {
        borderTop: `1px solid ${colors.borderPrimary}`,
        padding: `5px 0`,
        marginTop: `5px`
      }
      : null;

    const style2 = this.props.img ? {
      backgroundImage: `url(${this.props.img})`,
    }:{
      display: 'none'
    }

    return (
      <div style={style}>
        <Styles>
          <StylesAvatar style={style2}></StylesAvatar>{this.props.children}
        </Styles>
      </div>
    );
  }

}

DropdownItem.contextTypes = {
  component: PropTypes.any
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  divider: PropTypes.bool,
  img: PropTypes.string
};

DropdownItem.defaultProps = {
  divider: false
};
