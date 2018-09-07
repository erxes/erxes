import * as React from 'react';
import PropTypes from 'prop-types';
import Textarea from './Textarea';
import {
  Input,
  Select,
  SelectWrapper,
  FormLabel,
  Radio,
  Checkbox
} from './styles';

const propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultChecked: PropTypes.bool,
  checked: PropTypes.bool,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  options: PropTypes.array,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  round: PropTypes.bool,
  autoFocus: PropTypes.bool,
  onFocus: PropTypes.func,
  componentClass: PropTypes.oneOf([
    'select',
    'radio',
    'checkbox',
    'textarea',
    'input'
  ])
};

const defaultProps = {
  componentClass: 'input',
  required: false,
  defaultChecked: false,
  disabled: false
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

class FormControl extends React.Component {
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
      onChange,
      onKeyPress: props.onKeyPress,
      onClick: props.onClick,
      value: props.value,
      defaultValue: props.defaultValue,
      [props.defaultChecked
        ? 'defaultChecked'
        : 'checked']: props.defaultChecked
        ? props.defaultChecked
        : props.checked,
      placeholder: props.placeholder,
      type: props.type,
      name: props.name,
      round: props.round,
      required: props.required,
      disabled: props.disabled,
      onFocus: props.onFocus,
      autoFocus: props.autoFocus,
      min: props.min,
      max: props.max,
      id: props.id
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

FormControl.propTypes = propTypes;
FormControl.defaultProps = defaultProps;

export default FormControl;
