import React from 'react';
import PropTypes from 'prop-types';
import { BreadCrumb } from '../../common/components';
import { TopBar } from '../styles';
import QuickNavigation from './QuickNavigation';

const propTypes = {
  breadcrumb: PropTypes.array.isRequired
};

function Header({ breadcrumb = [] }) {
  return (
    <TopBar>
      <BreadCrumb>
        {breadcrumb.map(b => (
          <BreadCrumb.Item href={b.link} active={!b.link} key={b.title}>
            {b.title}
          </BreadCrumb.Item>
        ))}
      </BreadCrumb>

      <QuickNavigation />
    </TopBar>
  );
}

Header.propTypes = propTypes;

export default Header;
