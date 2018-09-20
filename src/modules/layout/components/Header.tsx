import { BreadCrumb, Filter } from 'modules/common/components';
import { dimensions } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';

type Props = {
  breadcrumb: any,
  queryParams?: any
};

const PageHeader = styled.div`
  height: ${dimensions.headerSpacing}px;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 2;
`;

function Header({ breadcrumb, queryParams }: Props) {
  return (
    <PageHeader>
      <BreadCrumb breadcrumbs={breadcrumb} />
      {queryParams && <Filter />}
    </PageHeader>
  );
}

export default Header;
