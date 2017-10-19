import React, {Component} from 'react';
import styled from "styled-components"
import PropTypes from "prop-types";
import ClickOutside from 'react-click-outside';

const Styles = styled.span `
  position:relative;
  cursor:pointer;
`
const StylesItem = styled.div `
  display:block;
  position:absolute;
  top:calc(100% + 10px);
  right:0;
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
    const {trigger} = this.props;
    const el = this.input;
    if (trigger === 'hover') {
      el.addEventListener('mouseenter', this.show.bind(this));
      el.addEventListener('mouseleave', this.hide.bind(this));
    } else if (trigger === 'click') {
      el.addEventListener('click', this.handleClick.bind(this));
    }
  }
  render() {
    return (
      <div ref={(input) => this.input = input}>
        <Styles>
          {this.props.children}
          <StylesItem style={{display: this.state.visible? '' : 'none'}}>
            {this.props.item}
          </StylesItem>
        </Styles>
      </div>
    );
  }

}

Dropdown.propTypes = {
  item: PropTypes.node.isRequired,
  children:PropTypes.node.isRequired,
  trigger: PropTypes.oneOf(['hover', 'click'])
};

Dropdown.defaultProps = {
  trigger: 'click'
};

export default ClickOutside(Dropdown);
