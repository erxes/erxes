import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import { Title } from 'modules/common/styles/main';
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

    if (!currentBrand._id) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="No Brands"
          size="small"
        />
      );
    }

    const trigger = (
      <Button id={'ManageIntegration'} btnStyle="simple" icon="web-grid-alt">
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

    const leftActionBar = <Title>{currentBrand.name}</Title>;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${currentBrand.name || ''}`}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={
          <HeaderDescription
            icon="/images/actions/32.svg"
            title={'Brands'}
            description={__(
              'Add unlimited Brands with unlimited support to further your growth and accelerate your business'
            )}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        leftSidebar={
          <Sidebar
            currentBrandId={currentBrand._id}
            queryParams={queryParams}
          />
        }
        content={
          <DataWithLoader
            data={
              <IntegrationList
                queryParams={queryParams}
                variables={{ brandId: currentBrand._id }}
                disableAction={true}
                integrationsCount={integrationsCount}
              />
            }
            loading={loading}
            count={integrationsCount}
            emptyText="Add an integration in this Brand"
            emptyImage="/images/actions/2.svg"
          />
        }
        footer={currentBrand._id && <Pagination count={integrationsCount} />}
      />
    );
  }
}

export default Brands;
