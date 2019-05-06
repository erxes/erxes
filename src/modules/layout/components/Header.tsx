import { BreadCrumb, Filter, Submenu } from 'modules/common/components';
import { dimensions } from 'modules/common/styles';
import * as React from 'react';
import styled from 'styled-components';
import { IBreadCrumbItem, ISubMenuItem } from '../../common/types';

type Props = {
  breadcrumb?: IBreadCrumbItem[];
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
  padding-left: ${dimensions.unitSpacing}px;
`;

function Header({ breadcrumb, queryParams, submenu }: Props) {
  return (
    <PageHeader>
      {breadcrumb && <BreadCrumb breadcrumbs={breadcrumb} />}
      {submenu && <Submenu items={submenu} />}
      {queryParams && <Filter queryParams={queryParams} />}
    </PageHeader>
  );
}

export default Header;
