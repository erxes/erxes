import React, {Component} from 'react';
import styled, {css} from "styled-components"
import {colors} from "../../styles";
import PropTypes from "prop-types";
import ReactDOM from 'react-dom';

const Styles = styled.div `
  padding:10px 0;
  border:1px solid #eee;
  background:#fff;
  box-shadow:0 2px 4px 0 #ddd;
  `

export default class DropdownMenu extends Component {
  render() {
    return (
      <Styles>
        <div>{this.props.children}</div>
      </Styles>
    );
  }

}
