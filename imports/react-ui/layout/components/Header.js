import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'react-bootstrap';

const propTypes = {
  breadcrumb: PropTypes.array.isRequired,
};

function Header({ breadcrumb = [] }) {
  return (
    <div className="main-header">
      <Breadcrumb>
        {breadcrumb.map(b => (
          <Breadcrumb.Item href={b.link} active={!b.link} key={b.title}>
            {b.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
}

Header.propTypes = propTypes;

export default Header;
