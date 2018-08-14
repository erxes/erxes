import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import {
  Pagination,
  DataWithLoader,
  Button,
  ModalTrigger
} from 'modules/common/components';
import { IntegrationList } from 'modules/settings/integrations/containers/common';
import { Sidebar, ManageIntegrations } from '../containers';

const propTypes = {
  integrationsCount: PropTypes.number.isRequired,
  queryParams: PropTypes.object,
  currentBrand: PropTypes.object,
  loading: PropTypes.bool
};

class Brands extends Component {
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

Brands.propTypes = propTypes;
Brands.contextTypes = {
  __: PropTypes.func
};

export default Brands;
