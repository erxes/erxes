import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';
import { BreadCrumb, Filter } from 'modules/common/components';

const propTypes = {
  breadcrumb: PropTypes.array.isRequired,
  queryParams: PropTypes.object
};

const PageHeader = styled.div`
  height: ${dimensions.headerSpacing}px;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 2;
`;

function Header({ breadcrumb = [], queryParams }) {
  return (
    <PageHeader>
      <BreadCrumb breadcrumbs={breadcrumb} />
      {queryParams && <Filter queryParams={queryParams} />}
    </PageHeader>
  );
}

Header.propTypes = propTypes;

export default Header;
