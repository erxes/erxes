import React from 'react';

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.FormEvent) => void;
};

class DropdownToggle extends React.Component<Props> {
  handleClick = e => {
    e.preventDefault();

    const { onClick } = this.props;

    if (onClick) {
      onClick(e);
    }
  };

  render() {
    return <div onClick={this.handleClick}>{this.props.children}</div>;
  }
}

export default DropdownToggle;
