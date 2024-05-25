import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.FormEvent) => void;
};

class DropdownToggle extends React.Component<Props> {
  handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { onClick } = this.props;

    if (onClick) {
      onClick(e as unknown as React.FormEvent); // Cast to React.FormEvent if needed
    }
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();

      const { onClick } = this.props;

      if (onClick) {
        onClick(e as unknown as React.FormEvent); // Cast to React.FormEvent if needed
      }
    }
  };

  render() {
    return (
      <div
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default DropdownToggle;
