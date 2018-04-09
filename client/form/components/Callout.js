import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TopBar } from './';

const propTypes = {
  formData: PropTypes.object,
  onSubmit: PropTypes.func,
  color: PropTypes.string,
  setHeight: PropTypes.func
};

class Callout extends Component {
  componentDidMount() {
    this.props.setHeight();
  }
  
  render() {
    const { formData, onSubmit, color } = this.props;
    const { callout } = formData || {};
    const { skip, title, buttonText, body } = callout;
    
    if (skip) {
      return null;
    }

    return (
      <div className="erxes-form">
        <TopBar title={title} color={color} />
        <div className="erxes-form-content">
          <div className="erxes-callout-body">{body}</div>
          <button
            style={{ background: color }}
            type="button"
            className="btn btn-block"
            onClick={onSubmit}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  }
}

Callout.propTypes = propTypes;

export default Callout;
