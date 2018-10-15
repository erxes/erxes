import * as React from 'react';
import { TextArea } from './styles';

type Props = {
  onChange?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  maxHeight?: number;
};

class Textarea extends React.Component<Props> {
  private area;

  constructor(props, context) {
    super(props, context);

    this.onChange = this.onChange.bind(this);
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

  onChange(e) {
    const { onChange } = this.props;

    this.setHeight();

    if (onChange) {
      onChange(e);
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
        onChange={this.onChange}
      />
    );
  }
}

export default Textarea;
