import BreadCrumb from 'modules/common/components/breadcrumb/BreadCrumb';
import Filter from 'modules/common/components/filter/Filter';
import Submenu from 'modules/common/components/submenu/Submenu';
import { dimensions } from 'modules/common/styles';
import { __, setTitle } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { IBreadCrumbItem, ISubMenuItem } from '../../common/types';

type Props = {
  breadcrumb?: IBreadCrumbItem[];
  submenu?: ISubMenuItem[];
  queryParams?: any;
  title: string;
};

const PageHeader = styled.div`
  height: ${dimensions.headerSpacing}px;
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 3;
  padding-left: ${dimensions.coreSpacing * 1.5}px;
`;

class Header extends React.Component<Props> {
  setTitle() {
    const { title } = this.props;

    setTitle(
      title,
      title === `${__('Team Inbox')}` && document.title.startsWith('(1)')
    );
  }

  componentDidUpdate() {
    this.setTitle();
  }

  componentDidMount() {
    this.setTitle();
  }

  render() {
    const { breadcrumb, submenu, queryParams } = this.props;

    return (
      <PageHeader>
        {breadcrumb && <BreadCrumb breadcrumbs={breadcrumb} />}
        {submenu && <Submenu items={submenu} />}
        {queryParams && <Filter queryParams={queryParams} />}
      </PageHeader>
    );
  }
}

export default Header;
