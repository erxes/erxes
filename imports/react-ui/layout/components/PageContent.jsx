import React, { PropTypes } from 'react';


const propTypes = {
  actionBar: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node,
};

function PageContent({ actionBar, footer, children }) {
  return (
    <div className="main-content">
      {actionBar}
      <div className="content">{children}</div>
      {footer ? <div className="footer">{footer}</div> : false}
    </div>
  );
}

PageContent.propTypes = propTypes;

export default PageContent;
