import * as React from 'react';
import {
  Checkbox,
  FormLabel,
  Input,
  Radio,
  Select,
  SelectWrapper
} from './styles';
import Textarea from './Textarea';

type Props = {
  children?: React.ReactNode;
  id?: string;
  onChange?: (e: React.FormEvent<HTMLElement>) => void;
  onClick?: (e: React.MouseEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  defaultValue?: any;
  value?: any;
  defaultChecked?: boolean;
  checked?: boolean;
  placeholder?: string;
  type?: string;
  name?: string;
  options?: any[];
  required?: boolean;
  disabled?: boolean;
  round?: boolean;
  autoFocus?: boolean;
  onFocus?: (e: React.FormEvent<HTMLElement>) => void;
  componentClass?: string;
  min?: number;
  max?: number;
  rows?: number;
  inline?: boolean;
  className?: string;
};

const renderElement = (Element, attributes, type, child) => {
  return (
    <FormLabel key={attributes.key ? attributes.key : null}>
      <Element {...attributes} type={type} />
      <span>
        {child && '\u00a0\u00a0'}
        {child}
      </span>
    </FormLabel>
  );
};

class FormControl extends React.Component<Props> {
  static defaultProps = {
    componentClass: 'input',
    defaultChecked: false,
    disabled: false,
    required: false
  };

  render() {
    const props = this.props;
    const childNode = props.children;
    const elementType = props.componentClass;

    // cancel custom browser default form validation error
    const onChange = e => {
      e.target.classList.remove('form-invalid');

      if (props.onChange) {
        props.onChange(e);
      }
    };

    const attributes = {
      autoFocus: props.autoFocus,
      defaultValue: props.defaultValue,
      [props.defaultChecked
        ? 'defaultChecked'
        : 'checked']: props.defaultChecked
        ? props.defaultChecked
        : props.checked,
      disabled: props.disabled,
      id: props.id,
      max: props.max,
      min: props.min,
      name: props.name,
      onChange,
      onClick: props.onClick,
      onFocus: props.onFocus,
      onKeyPress: props.onKeyPress,
      placeholder: props.placeholder,
      required: props.required,
      round: props.round,
      type: props.type,
      value: props.value
    };

    if (elementType === 'select') {
      if (props.options) {
        return (
          <SelectWrapper>
            <Select {...attributes}>
              {props.options.map((option, index) => {
                return (
                  <option key={index} value={option.value || ''}>
                    {option.label || ''}
                  </option>
                );
              })}
            </Select>
          </SelectWrapper>
        );
      }
      return (
        <SelectWrapper>
          <Select {...attributes}>{childNode}</Select>
        </SelectWrapper>
      );
    }

    if (elementType === 'radio') {
      if (props.options) {
        return props.options.map((option, index) => {
          return renderElement(
            Radio,
            { key: index, ...attributes, ...option },
            elementType,
            option.childNode
          );
        });
      }

      return renderElement(Radio, attributes, elementType, childNode);
    }

    if (elementType === 'checkbox') {
      return renderElement(Checkbox, attributes, elementType, childNode);
    }

    if (elementType === 'textarea') {
      return <Textarea {...props} />;
    }

    return <Input {...attributes} />;
  }
}

export default FormControl;
