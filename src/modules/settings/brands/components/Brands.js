import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Sidebar, IntegrationList, IntegrationForm } from '../containers';
import {
  Pagination,
  DataWithLoader,
  Button,
  ModalTrigger
} from 'modules/common/components';

const propTypes = {
  totalIntegrationsCount: PropTypes.number.isRequired,
  queryParams: PropTypes.object,
  currentBrand: PropTypes.object,
  loading: PropTypes.bool
};

class Brands extends Component {
  render() {
    const {
      totalIntegrationsCount,
      currentBrand,
      queryParams,
      loading
    } = this.props;

    const breadcrumb = [
      { title: 'Settings', link: '/settings' },
      { title: 'Brands', link: '/settings/brands' },
      { title: `${currentBrand.name}` }
    ];

    const trigger = (
      <Button btnStyle="success" size="small" icon="wrench">
        Manage integration
      </Button>
    );

    const rightActionBar = currentBrand._id && (
      <ModalTrigger title="Manage Integration" trigger={trigger} size="lg">
        <IntegrationForm currentBrand={currentBrand} />
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
        footer={
          currentBrand._id && <Pagination count={totalIntegrationsCount} />
        }
        content={
          <DataWithLoader
            data={
              <IntegrationList
                currentBrand={currentBrand}
                queryParams={queryParams}
              />
            }
            loading={loading}
            count={totalIntegrationsCount}
            emptyText="There is no integration in this Brand"
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

Brands.propTypes = propTypes;

export default Brands;
