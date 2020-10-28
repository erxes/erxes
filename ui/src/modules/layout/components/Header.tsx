import BreadCrumb from 'modules/common/components/breadcrumb/BreadCrumb';
import Filter from 'modules/common/components/filter/Filter';
import Submenu from 'modules/common/components/submenu/Submenu';
import { __, setTitle } from 'modules/common/utils';
import React from 'react';
import { IBreadCrumbItem, ISubMenuItem } from '../../common/types';
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
        {queryParams && <Filter queryParams={queryParams} />}
      </PageHeader>
    );
  }
}

export default Header;
