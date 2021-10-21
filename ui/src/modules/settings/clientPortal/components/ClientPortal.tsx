import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { Title } from 'modules/common/styles/main';
import { IRouterProps } from 'modules/common/types';
import { ContentBox } from 'modules/settings/styles';
import React from 'react';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import ClientPortalDetailContainer from '../containers/ClientPortalDetail';
import List from '../containers/List';

type Props = {
  integrationsCount: number;
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

    const leftActionBar = <Title>Client portal</Title>;

    return (
      <Wrapper
        header={
          <Wrapper.Header title="Client portal" breadcrumb={breadcrumb} />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/32.svg"
            title={'Client Portals'}
            description={__(
              'Add unlimited Client Portals with unlimited support to further your growth and accelerate your business'
            )}
          />
        }
        actionBar={<Wrapper.ActionBar left={leftActionBar} />}
        leftSidebar={<List {...this.props} />}
        content={
          <DataWithLoader
            data={
              <ContentBox>
                <ClientPortalDetailContainer
                  queryParams={queryParams}
                  history={history}
                />
              </ContentBox>
            }
            loading={loading}
            emptyText="Add an integration in this Brand"
            emptyImage="/images/actions/2.svg"
          />
        }
      />
    );
  }
}

export default ClientPortal;
