import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Select,
  SelectWrapper,
  Textarea,
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
  required: PropTypes.bool,
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
  defaultChecked: false
};

const renderElement = (Element, attributes, type, child) => {
  return (
    <FormLabel>
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

    //cancel custom browser default form validation error
    const onChange = e => {
      e.target.classList.remove('form-invalid');

      props.onChange && props.onChange(e);
    };

    const attributes = {
      ...props,
      onChange,
      [props.defaultChecked
        ? 'defaultChecked'
        : 'checked']: props.defaultChecked
        ? props.defaultChecked
        : props.checked
    };

    if (elementType === 'select') {
      return (
        <SelectWrapper>
          <Select {...attributes}>{childNode}</Select>
        </SelectWrapper>
      );
    }

    if (elementType === 'radio') {
      return renderElement(Radio, attributes, elementType, childNode);
    }

    if (elementType === 'checkbox') {
      return renderElement(Checkbox, attributes, elementType, childNode);
    }

    if (elementType === 'textarea') {
      return <Textarea {...attributes} />;
    }

    return <Input {...attributes} />;
  }
}

FormControl.propTypes = propTypes;
FormControl.defaultProps = defaultProps;

export default FormControl;
