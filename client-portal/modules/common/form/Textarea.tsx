import React from 'react';
import { TextArea } from './styles';

type Props = {
  onChange?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  hasError?: boolean;
  maxHeight?: number;
};

class Textarea extends React.Component<Props> {
  private area;

  onChange = (e) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(e);
    }
  };

  setArea = (area) => {
    this.area = area;
  };

  render() {
    const { maxHeight, ...props } = this.props;

    return (
      <TextArea
        {...props}
        innerRef={this.setArea}
        maxHeight={maxHeight}
        onChange={this.onChange}
      />
    );
  }
}

export default Textarea;
