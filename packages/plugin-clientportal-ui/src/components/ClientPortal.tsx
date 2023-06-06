import ClientPortalDetailContainer from '../containers/ClientPortalDetail';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import HeaderDescription from '@erxes/ui/src/components/HeaderDescription';
import { IRouterProps } from '@erxes/ui/src/types';
import List from '../containers/List';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  queryParams: any;
  loading?: boolean;
} & IRouterProps;

class ClientPortal extends React.Component<Props, {}> {
  render() {
    const { loading = false, queryParams, history } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Client Portal'), link: '/settings/client-portal' }
    ];

    const count = queryParams._id ? 1 : 0;

    return (
      <Wrapper
        header={
          <Wrapper.Header title="Client portal" breadcrumb={breadcrumb} />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/32.svg"
            title="Client Portal"
            description={__(
              'Add unlimited Client Portals with unlimited support to further your growth and accelerate your business'
            )}
          />
        }
        leftSidebar={<List {...this.props} />}
        content={
          <DataWithLoader
            data={
              <ClientPortalDetailContainer
                queryParams={queryParams}
                history={history}
              />
            }
            count={count}
            loading={loading}
            emptyText="Getting Started with Client Portal"
            emptyImage="/images/actions/13.svg"
          />
        }
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default ClientPortal;
