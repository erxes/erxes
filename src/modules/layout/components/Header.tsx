import { BreadCrumb, Filter, Submenu } from 'modules/common/components';
import { dimensions } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import { IBreadCrumbItem, ISubMenuItem } from '../../common/types';

type Props = {
  breadcrumb: IBreadCrumbItem[];
  submenu?: ISubMenuItem[];
  queryParams?: any;
};

const PageHeader = styled.div`
  height: ${dimensions.headerSpacing}px;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 2;
`;

function Header({ breadcrumb, queryParams, submenu }: Props) {
  let isVisible = true;

  if(submenu) {
    isVisible = false;
  }
  
  return (
    <PageHeader>
      <Submenu items={submenu} />
      <BreadCrumb breadcrumbs={breadcrumb} isVisible={isVisible} />
      {queryParams && <Filter queryParams={queryParams} />}
    </PageHeader>
  );
}

export default Header;
