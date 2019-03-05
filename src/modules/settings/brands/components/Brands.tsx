import { DescImg, MainDescription } from 'modules/settings/styles';
import * as React from 'react';
import {
  Button,
  DataWithLoader,
  Info,
  ModalTrigger,
  Pagination
} from '../../../common/components';
import { __ } from '../../../common/utils';
import { Wrapper } from '../../../layout/components';
import { IntegrationList } from '../../integrations/containers/common';
import { ManageIntegrations, Sidebar } from '../containers';
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

    const actionBarLeft = (
      <MainDescription>
        <DescImg src="/images/actions/32.svg" />
        <span>
          <h4>{__('Brands')}</h4>
          {__(
            'Add unlimited Brands with unlimited support to further your growth and accelerate your business.'
          )}
        </span>
      </MainDescription>
    );

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
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={
          <Wrapper.ActionBar left={actionBarLeft} right={rightActionBar} />
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
