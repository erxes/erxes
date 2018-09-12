import React, { Component } from 'react';
import { TextArea } from './styles';

type Props = {
  onChange?: (...args: any[]) => void,
  maxHeight?: number
};

class Textarea extends Component<Props> {
  private area;

  constructor(props, context) {
    super(props, context);

    this.change = this.change.bind(this);
  }

  componentDidMount() {
    this.area.style.height = `${this.area.scrollHeight}px`;
  }

  setHeight() {
    const textarea = this.area;

    // for reset element's scrollHeight
    textarea.style.height = 0;
    // add border 1px height
    textarea.style.height = `${textarea.scrollHeight + 1}px`;
  }

  change(...params) {
    const { onChange } = this.props;

    this.setHeight();

    if (onChange) {
      onChange(...params);
    }
  }

  render() {
    const { maxHeight, ...props } = this.props;

    return (
      <TextArea
        {...props}
        innerRef={area => {
          this.area = area;
        }}
        maxHeight={maxHeight}
        onChange={this.change}
      />
    );
  }
}

export default Textarea;
