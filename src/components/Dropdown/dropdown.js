import React, {Component} from 'react';
import styled from "styled-components"
import PropTypes from "prop-types";
import ClickOutside from 'react-click-outside';

const Styles = styled.span `
  position:relative;
  cursor:pointer;
`

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  getChildContext() {
    return {component: this}
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
    return (
      <span ref={(el) => this.el = el}>
        <Styles>
          {this.props.children}
          {this.props.item}
        </Styles>
      </span>
    );
  }

}

Dropdown.childContextTypes = {
  component: PropTypes.any
};

Dropdown.propTypes = {
  item: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  trigger: PropTypes.oneOf(['hover', 'click']),
  align: PropTypes.oneOf(['left', 'right']),
  width: PropTypes.number,
};

Dropdown.defaultProps = {
  trigger: 'click',
  align: 'left',
  width: 100,
};

export default ClickOutside(Dropdown);
