import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';
import { BreadCrumb } from 'modules/common/components';

const propTypes = {
  breadcrumb: PropTypes.array.isRequired
};

const PageHeader = styled.div`
  height: ${dimensions.headerSpacing}px;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
`;

function Header({ breadcrumb = [] }) {
  return (
    <PageHeader>
      <BreadCrumb>
        {breadcrumb.map(b => (
          <BreadCrumb.Item href={b.link} active={!b.link} key={b.title}>
            {b.title}
          </BreadCrumb.Item>
        ))}
      </BreadCrumb>
    </PageHeader>
  );
}

Header.propTypes = propTypes;

export default Header;
