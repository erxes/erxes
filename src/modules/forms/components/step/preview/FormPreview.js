import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CommonPreview from './CommonPreview';
import { FormFieldPreview } from './';

const propTypes = {
  formTitle: PropTypes.string,
  formDesc: PropTypes.string,
  formBtnText: PropTypes.string,
  color: PropTypes.string,
  theme: PropTypes.string,
  fields: PropTypes.array,
  onFieldEdit: PropTypes.func,
  onChange: PropTypes.func,
  type: PropTypes.string
};

class FormPreview extends Component {
  render() {
    const {
      formTitle,
      formDesc,
      formBtnText,
      color,
      theme,
      fields,
      onFieldEdit,
      onChange,
      type
    } = this.props;

    return (
      <CommonPreview
        title={formTitle}
        theme={theme}
        color={color}
        btnText={formBtnText}
        btnStyle="primary"
        bodyValue={formDesc}
        type={type}
      >
        <FormFieldPreview
          fields={fields}
          onFieldEdit={onFieldEdit}
          onChange={onChange}
        />
      </CommonPreview>
    );
  }
}

FormPreview.propTypes = propTypes;

export default FormPreview;
