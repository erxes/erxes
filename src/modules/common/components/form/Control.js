import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withFormsy, addValidationRule } from 'formsy-react';
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
  validations: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  validationError: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  getErrorMessages: PropTypes.func,
  children: PropTypes.node,
  id: PropTypes.string,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
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

addValidationRule('isValue', function(values, value) {
  return Boolean(value);
});

class EnhancedFormControl extends React.Component {
  render() {
    const { __ } = this.context;
    const props = this.props;
    const childNode = props.children;
    const elementType = props.componentClass;

    const updatedProps = { ...props };

    delete updatedProps.children;

    const attributes = {
      ...updatedProps,
      checked: props.checked
    };

    const error =
      typeof props.isPristine === 'function'
        ? props.isPristine() ? null : props.getErrorMessage()
        : null;

    if (elementType === 'select') {
      if (props.options) {
        return (
          <Fragment>
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
            <span>{__(error)}</span>
          </Fragment>
        );
      }
      return (
        <Fragment>
          <SelectWrapper>
            <Select {...attributes}>{childNode}</Select>
          </SelectWrapper>
          <span>{__(error)}</span>
        </Fragment>
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
      return (
        <Fragment>
          <Textarea {...props} />
          <span>{__(error)}</span>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Input {...attributes} />
        <span>{__(error)}</span>
      </Fragment>
    );
  }
}

EnhancedFormControl.propTypes = {
  getErrorMessage: PropTypes.func,
  isPristine: PropTypes.func
};

EnhancedFormControl.contextTypes = {
  __: PropTypes.func
};

class WithFormsy extends React.Component {
  render() {
    const props = { ...this.props };

    props.onChange = e => {
      return props.setValue(e.currentTarget.value);
    };

    props.value = props.getValue() || '';

    return <EnhancedFormControl {...props} />;
  }
}

const WithFormsyContainer = withFormsy(WithFormsy);

const FormControl = props => {
  if (props.validations) {
    return <WithFormsyContainer {...props} />;
  }

  return <EnhancedFormControl {...props} />;
};

FormControl.propTypes = propTypes;
FormControl.defaultProps = defaultProps;

export default FormControl;
