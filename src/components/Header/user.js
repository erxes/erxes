import React, {Component} from 'react';
import styled, {css} from "styled-components"
import {colors} from "../../styles";
import {lighten} from "../../utils/color";
import Icon from "../Icon";
import Dropdown from "../Dropdown";
import Button from '../Button';
const Styles = styled.div `
  height:100%;
  padding:0 20px;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: justify;
  justify-content: space-between;
  -ms-flex-align: center;
  align-items: center;
  background:${lighten(colors.colorPrimary, 10)};
  .avatar{
    border-radius:100%;
    height:30px;
    width:30px;
    background:url('images/userDefaultIcon.png');
    background-repeat:no-repeat;
    background-size:cover;
    background-position:center center;
    margin:0 10px;
  }`

export default class User extends Component {
  render() {
    return (
      <Dropdown item={(
        <Button>456456456</Button>
      )}>
        <Styles>
          <div className='name'>{this.props.children[0]} {this.props.children[1]}</div>
          <div className='avatar'></div>
          <Icon icon="ios-arrow-down"></Icon>
        </Styles>
      </Dropdown>
    );
  }
}
