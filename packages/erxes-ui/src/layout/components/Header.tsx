import React from 'react';
import BreadCrumb from 'erxes-ui/lib/components/breadcrumb/BreadCrumb';
// import Filter from 'erxes-ui/lib/components/filter/Filter';
import Submenu from 'erxes-ui/lib/components/subMenu/Submenu';
import { IBreadCrumbItem, ISubMenuItem } from 'erxes-ui/lib/types';
import { __, setTitle } from 'erxes-ui/lib/utils/core';
import { PageHeader } from '../styles';

type Props = {
  breadcrumb?: IBreadCrumbItem[];
  submenu?: ISubMenuItem[];
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
        {/* {queryParams && <Filter queryParams={queryParams} />} */}
      </PageHeader>
    );
  }
}

export default Header;
