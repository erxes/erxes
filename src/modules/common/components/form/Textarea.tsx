import * as React from 'react';
import { TextArea } from './styles';

type Props = {
  onChange?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  formErrorMessage?: React.ReactNode;
  maxHeight?: number;
};

class Textarea extends React.Component<Props> {
  private area;

  componentDidMount() {
    this.setHeight();
  }

  setHeight() {
    const textarea = this.area;

    // for reset element's scrollHeight
    textarea.style.height = 0;
    // add border 1px height
    textarea.style.height = `${textarea.scrollHeight + 1}px`;
  }

  onChange = e => {
    const { onChange } = this.props;

    this.setHeight();

    if (onChange) {
      onChange(e);
    }
  };

  setArea = area => {
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
