import React, {Component} from 'react';
import styled, {css} from "styled-components"
import {colors} from "../../styles";
import PropTypes from "prop-types";
import ReactDOM from 'react-dom';

const Styles = styled.div `
  .divider{
    border-top:1px solid #eee;
  }
  span:hover{
    background:#eee;
  }
  span{
    padding:10px;
    margin:5px 0;
    display:block;
  }
  `

export default class DropdownItem extends Component {
  render() {
    return (
      <Styles>
        <div className={this.props.divider ? 'divider' : ''}><span>{this.props.children}</span></div>
      </Styles>
    );
  }

}

DropdownItem.propTypes = {
  divider:PropTypes.bool,
};

DropdownItem.defaultProps = {
  divider: false
};
