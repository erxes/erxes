import React, {Component} from 'react';
import styled from "styled-components"
import PropTypes from "prop-types";
import ClickOutside from 'react-click-outside';

const Styles = styled.span `
  position:relative;
  cursor:pointer;
  padding-top:10px;
`

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  getChildContext() {
    return {
      component:this
    }
  }

  handleMenuItemClick(command, instance) {
    if (this.props.hideOnClick) {
      this.setState({visible: false});
    }

    if (this.props.command) {
      this.props.command(command, instance);
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

  initEvent() {
    const {trigger} = this.props;
    const el = this.el;
    if (trigger === 'hover') {
      el.addEventListener('mouseenter', this.show.bind(this));
      el.addEventListener('mouseleave', this.hide.bind(this));
    } else if (trigger === 'click') {
      el.addEventListener('click', this.show.bind(this));
    }
  }

  render() {
    const display = this.state.visible
      ? 'block'
      : 'none';

    return (
      <span ref={(el) => this.el = el} style={{
        display: 'inline-block'
      }}>
        {this.props.children}
        <Styles style={{
          display
        }}>{this.props.item}</Styles>
      </span>
    );
  }

}

Dropdown.childContextTypes = {
  component:PropTypes.any
};

Dropdown.propTypes = {
  item: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  trigger: PropTypes.oneOf(['hover', 'click']),
  hideOnClick: PropTypes.bool,
  command: PropTypes.func
};

Dropdown.defaultProps = {
  trigger: 'click',
  hideOnClick: true
};

export default ClickOutside(Dropdown);
