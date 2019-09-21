import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import React from 'react';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import IntegrationList from '../../integrations/containers/common/IntegrationList';
import ManageIntegrations from '../containers/ManageIntegrations';
import Sidebar from '../containers/Sidebar';
import { IBrand } from '../types';

type Props = {
  integrationsCount: number;
  queryParams: any;
  currentBrand: IBrand;
  loading: boolean;
};

class Brands extends React.Component<Props, {}> {
  render() {
    const {
      integrationsCount,
      currentBrand,
      queryParams,
      loading
    } = this.props;

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

    const content = props => (
      <ManageIntegrations
        {...props}
        queryParams={queryParams}
        currentBrand={currentBrand}
      />
    );

    const rightActionBar = currentBrand._id && (
      <ModalTrigger
        title="Manage Integration"
        trigger={trigger}
        size="lg"
        content={content}
      />
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${currentBrand.name || ''}`}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/32.svg"
                title="Brands"
                description="Add unlimited Brands with unlimited support to further your growth and accelerate your business."
              />
            }
            right={rightActionBar}
          />
        }
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
            emptyText="Add an integration in this Brand"
            emptyImage="/images/actions/2.svg"
          />
        }
      />
    );
  }
}

export default Brands;
