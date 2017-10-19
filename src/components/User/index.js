import React, {Component} from 'react';
import styled from "styled-components"
import {colors} from "../../styles";
import {lighten} from "../../utils/color";
import Icon from "../Icon";
import PropTypes from "prop-types";

const Styles = styled.div `
  height:100%;
  padding:5px 10px 5px 20px;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  color: ${colors.colorWhite};
  background:${lighten(colors.colorPrimary, 10)};
`
const StylesAvatar = styled.div`
  border-radius:100%;
  height:30px;
  width:30px;
  background-repeat:no-repeat;
  background-size:cover;
  background-position:center center;
  margin:0 10px;
`

export default class User extends Component {
  render() {
    return (
        <Styles>
          <div>{this.props.text}</div>
          <StylesAvatar style={{backgroundImage:`url(${this.props.img})`}}></StylesAvatar>
          <Icon icon={`ios-arrow-${this.props.arrow}`}></Icon>
        </Styles>
    );
  }
}

User.propTypes = {
  text: PropTypes.node.isRequired,
  img: PropTypes.node.isRequired,
  arrow: PropTypes.oneOf([
    "left",
    "right",
    "down",
    "up"
  ]),
};

User.defaultProps = {
  text:"",
  img: "images/userDefaultIcon.png",
  arrow: "down"
};
