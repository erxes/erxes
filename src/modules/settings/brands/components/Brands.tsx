import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ManageIntegrations, Sidebar } from '../containers';

type Props = {
  integrationsCount: number,
  queryParams: any,
  currentBrand: any,
  loading: boolean
}

class Brands extends Component<Props, {}> {
  static contextTypes =  {
    __: PropTypes.func
  }

  render() {
    const {
      integrationsCount,
      currentBrand,
      queryParams,
      loading
    } = this.props;

    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Brands'), link: '/settings/brands' },
      { title: `${currentBrand.name || ''}` }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="computer">
        Manage integration
      </Button>
    );

    const rightActionBar = currentBrand._id && (
      <ModalTrigger title="Manage Integration" trigger={trigger} size="lg">
        <ManageIntegrations
          queryParams={queryParams}
          currentBrand={currentBrand}
        />
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={<Wrapper.ActionBar right={rightActionBar} />}
        leftSidebar={
          <Sidebar
            currentBrandId={currentBrand._id}
            queryParams={queryParams}
          />
        }
        footer={currentBrand._id && <Pagination count={integrationsCount} />}
        content={
          <DataWithLoader
            data={
              <IntegrationList
                queryParams={queryParams}
                variables={{ brandId: currentBrand._id }}
              />
            }
            loading={loading}
            count={integrationsCount}
            emptyText="There is no integration in this Brand"
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

export default Brands;
