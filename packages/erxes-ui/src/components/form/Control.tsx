import {
  Checkbox,
  FormLabel,
  Input,
  Progress,
  Radio,
  Select,
  SelectWrapper
} from './styles';

import { Column } from '@erxes/ui/src/styles/main';
import ProgressBar from '../ProgressBar';
import React from 'react';
import Textarea from './Textarea';
import NumberInput from './NumberInput';

type Props = {
  children?: React.ReactNode;
  id?: string;
  onChange?: (e: React.FormEvent<HTMLElement>) => void;
  onClick?: (e: React.MouseEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
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
  autoComplete?: string;
  onFocus?: (e: React.FormEvent<HTMLElement>) => void;
  componentClass?: string;
  min?: number;
  max?: number;
  rows?: number;
  inline?: boolean;
  className?: string;
  errors?: any;
  registerChild?: (child: any) => void;
  onBlur?: (e: React.FormEvent<HTMLElement>) => void;
  maxHeight?: number;
  maxLength?: number;
  color?: string;
  align?: string;
  useNumberFormat?: boolean;
  fixed?: number; // useNumberFormat is true then used
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
    required: false,
    defaultChecked: false,
    disabled: false
  };

  componentDidMount() {
    const { registerChild } = this.props;

    if (registerChild) {
      registerChild(this);
    }
  }

  render() {
    const props = this.props;
    const childNode = props.children;
    const elementType = props.componentClass;
    const errorMessage = props.errors && props.errors[props.name || ''];

    // cancel custom browser default form validation error
    const onChange = e => {
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const attributes = {
      onChange,
      onKeyPress: props.onKeyPress,
      onKeyDown: props.onKeyDown,
      onClick: props.onClick,
      onBlur: props.onBlur,
      value: props.value,
      defaultValue: props.defaultValue,
      [props.defaultChecked
        ? 'defaultChecked'
        : 'checked']: props.defaultChecked
        ? props.defaultChecked
        : props.checked,
      placeholder: props.placeholder,
      hasError: errorMessage ? true : false,
      type: props.type,
      name: props.name,
      round: props.round,
      required: props.required,
      disabled: props.disabled,
      onFocus: props.onFocus,
      autoFocus: props.autoFocus,
      autoComplete: props.autoComplete,
      min: props.min,
      max: props.max,
      id: props.id,
      maxHeight: props.maxHeight,
      maxLength: props.maxLength,
      color: props.color,
      align: props.align
    };

    if (elementType === 'select') {
      if (props.options) {
        return (
          <Column>
            <SelectWrapper hasError={errorMessage}>
              <Select {...attributes}>
                {props.options.map((option, index) => {
                  return (
                    <option
                      key={index}
                      value={option.value || ''}
                      disabled={option.disabled}
                    >
                      {option.label || ''}
                    </option>
                  );
                })}
              </Select>
            </SelectWrapper>
            {errorMessage}
          </Column>
        );
      }

      return (
        <Column>
          <SelectWrapper hasError={errorMessage}>
            <Select {...attributes}>{childNode}</Select>
          </SelectWrapper>
          {errorMessage}
        </Column>
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

    if (elementType === 'poll') {
      const options = props.options;
      if (options) {
        const count = options.length;
        return options.map((option, index) => {
          const percentage = (index * 100) / count;

          return (
            <Progress key={attributes.key ? attributes.key : null}>
              <div>
                {renderElement(Radio, attributes, elementType, childNode)}
                <b>{option}: </b>
                <span>({percentage.toFixed(2)}%)</span>
              </div>
              <ProgressBar percentage={percentage} height="10px" />
            </Progress>
          );
        });
      }

      return null;
    }

    if (elementType === 'checkbox') {
      return renderElement(Checkbox, attributes, elementType, childNode);
    }

    if (elementType === 'textarea') {
      return (
        <Column>
          <Textarea {...props} hasError={errorMessage} />
          {errorMessage}
        </Column>
      );
    }

    if (props.type === 'number' && props.useNumberFormat) {
      return (
        <Column>
          <NumberInput {...attributes} fixed={props.fixed} />
          {errorMessage}
        </Column>
      );
    }

    return (
      <Column>
        <Input {...attributes} />
        {errorMessage}
      </Column>
    );
  }
}

export default FormControl;
