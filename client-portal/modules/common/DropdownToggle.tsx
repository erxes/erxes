import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.FormEvent) => void;
};

class DropdownToggle extends React.Component<Props> {
  handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { onClick } = this.props;

    if (onClick) {
      onClick(e);
    }
  };

  render() {
    return <button onClick={this.handleClick}>{this.props.children}</button>;
  }

}

export default DropdownToggle;
