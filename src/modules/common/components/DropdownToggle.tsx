import * as React from 'react';

type Props = {
  children: React.ReactNode;
  onClick?: (e: React.FormEvent) => void;
  bsRole: string;
};

class DropdownToggle extends React.Component<Props> {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();

    const { onClick } = this.props;

    if (onClick) {
      onClick(e);
    }
  }

  render() {
    return <div onClick={this.handleClick}>{this.props.children}</div>;
  }
}

export default DropdownToggle;
