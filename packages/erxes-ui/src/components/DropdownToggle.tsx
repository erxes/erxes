import React from 'react';

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.FormEvent) => void;
  id?: string;
};

class DropdownToggle extends React.Component<Props> {
  handleClick = e => {
    e.preventDefault();
    e.stopPropagation();

    const { onClick } = this.props;

    if (onClick) {
      onClick(e);
    }
  };

  render() {
    return (
      <div onClick={this.handleClick} id={this.props.id && this.props.id}>
        {this.props.children}
      </div>
    );
  }
}

export default DropdownToggle;
