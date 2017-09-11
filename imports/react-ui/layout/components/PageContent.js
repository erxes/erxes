import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
  actionBar: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
  relative: PropTypes.bool,
};

function PageContent({ actionBar, footer, children, relative }) {
  const contentClassName = classNames('content', { 'relative-content': relative });

  return (
    <div className="main-content">
      {actionBar}
      <div className={contentClassName}>{children}</div>
      {footer ? <div className="footer">{footer}</div> : false}
    </div>
  );
}

PageContent.propTypes = propTypes;

export default PageContent;
