import React, { PropTypes } from 'react';

const propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

class DropdownToggle extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.onClick(e);
  }

  render() {
    return (
      <div onClick={this.handleClick}>
        {this.props.children}
      </div>
    );
  }
}

DropdownToggle.propTypes = propTypes;

export default DropdownToggle;
