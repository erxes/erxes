import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  size: PropTypes.string,
  linkUrl: PropTypes.string,
  linkText: PropTypes.string,
};

function EmptyState({ text, icon, size, linkUrl, linkText }) {
  const classNames = `empty-state ${size}`;
  return (
    <div className={classNames}>
      {icon}
      {text}
      {linkUrl && linkText ? <Button bsSize="small" href={linkUrl}>{linkText}</Button> : null}
    </div>
  );
}

EmptyState.propTypes = propTypes;

export default EmptyState;
