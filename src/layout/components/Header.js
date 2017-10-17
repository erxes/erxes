import React from 'react';
import PropTypes from 'prop-types';
import { TopBar } from '../styles';

const propTypes = {
  breadcrumb: PropTypes.array.isRequired,
};

function Header({ breadcrumb = [] }) {
  return (
    <TopBar>
      <div>
        {breadcrumb.map(b => (
          <div href={b.link} key={b.title}>
            {b.title}
          </div>
        ))}
      </div>
    </TopBar>
  );
}

Header.propTypes = propTypes;

export default Header;
