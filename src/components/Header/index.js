import React, {Component} from 'react';
import styled, {css} from "styled-components"
import {colors} from "../../styles";

const Styles = styled.header `
  width:100%;
  height:50px;
  background: ${colors.colorPrimary};
  color: ${colors.colorWhite};
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -ms-flex-align: center;
  align-items:center;
  .text{
    margin:0 20px;
  }
  .user{
    display:flex;
    height:100%;
    margin-right:20px;
  }`

export default class Header extends Component {
  render() {
    return (
      <Styles>
        <div className='text'>
          <div>{this.props.children[0]}</div>
        </div>
        <div className='user'>
          {this.props.children[1]}
        </div>
      </Styles>
    );
  }
}
