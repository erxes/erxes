import React from 'react';
import BreadCrumb from '@erxes/ui/src/components/breadcrumb/BreadCrumb';
import Filter from '@erxes/ui/src/components/filter/Filter';
import Submenu from '@erxes/ui/src/components/subMenu/Submenu';
import { IBreadCrumbItem } from '@erxes/ui/src/types';
import { __, setTitle } from '@erxes/ui/src/utils/core';
import { PageHeader } from '../styles';

type Props = {
  breadcrumb?: IBreadCrumbItem[];
  submenu?: IBreadCrumbItem[];
  queryParams?: any;
  title: string;
  additionalMenuItem?: React.ReactNode;
};

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
    const { breadcrumb, submenu, queryParams, additionalMenuItem } = this.props;

    return (
      <PageHeader>
        {breadcrumb && <BreadCrumb breadcrumbs={breadcrumb} />}
        {submenu && (
          <Submenu items={submenu} additionalMenuItem={additionalMenuItem} />
        )}
        {queryParams && <Filter queryParams={queryParams} />}
      </PageHeader>
    );
  }
}

export default Header;
