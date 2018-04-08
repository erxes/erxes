import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  formData: PropTypes.object,
  onSubmit: PropTypes.func,
};

function Callout({ formData, onSubmit }) {
  const { callout } = formData || {};
  const { skip, title, buttonText, body } = callout;

  if (skip) {
    return null;
  }

  return (
    <div className="erxes-form">
      <div className="erxes-topbar thiner">
        <div className="erxes-middle">
          <div className="erxes-topbar-title">
            <div>{title}</div>
          </div>
        </div>
      </div>
      <div className="erxes-form-content">
        {body}

        <button
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

Callout.propTypes = propTypes;

export default Callout;
