import React, {Component} from 'react';
import styled, {css} from "styled-components"
import {colors} from "../../styles";
import PropTypes from "prop-types";
import ReactDOM from 'react-dom';
import ClickOutside from 'react-click-outside';

const Styles = styled.span `
  position:relative;
  cursor:pointer;
  .dropdown-item{
    display:block;
  }
  .dropdown-item{
    display:block;
    position:absolute;
    top:calc(100% + 10px);
    right:0;
  }
  `

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }
  componentDidMount() {
    this.initEvent();
  }
  show() {
    this.setState({visible: true});
  }
  hide() {
    this.setState({visible: false});
  }
  handleClickOutside() {
    if (this.state.visible) {
      this.hide();
    }
  }
  handleClick() {
    this.setState({
      visible: !this.state.visible
    });
  }
  initEvent() {
    const {trigger, item} = this.props;
    const el = ReactDOM.findDOMNode(this.refs.dropdown);
    console.log(el);
    if (trigger === 'hover') {
      el.addEventListener('mouseenter', this.show.bind(this));
      el.addEventListener('mouseleave', this.hide.bind(this));
    } else if (trigger === 'click') {
      el.addEventListener('click', this.handleClick.bind(this));
    }
  }
  render() {
    return (
      <Styles ref='dropdown'>
        {this.props.children}
        <div className='dropdown-item' style={{display: this.state.visible? '' : 'none'}}>
          {this.props.item}
        </div>
      </Styles>
    );
  }

}

Dropdown.propTypes = {
  item: PropTypes.node.isRequired,
  trigger: PropTypes.oneOf(['hover', 'click'])
};

Dropdown.defaultProps = {
  trigger: 'click'
};

export default ClickOutside(Dropdown);
