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
  kind: 'client' | 'vendor';
} & IRouterProps;

class ClientPortal extends React.Component<Props, {}> {
  render() {
    const { loading = false, queryParams, history } = this.props;
    const text = this.props.kind === 'client' ? 'Client' : 'Vendor';

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Business Portal'), link: '/settings/business-portal' },
      {
        title: __(`${text} Portal`),
        link: `/settings/business-portal/${this.props.kind}`
      }
    ];

    const count = queryParams._id ? 1 : 0;

    return (
      <Wrapper
        header={
          <Wrapper.Header title="Business portal" breadcrumb={breadcrumb} />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/32.svg"
            title="Business Portal"
            description={__(
              'Add unlimited Business Portals with unlimited support to further your growth and accelerate your business'
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
                kind={this.props.kind}
              />
            }
            count={count}
            loading={loading}
            emptyText="Getting Started with Business Portal"
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
