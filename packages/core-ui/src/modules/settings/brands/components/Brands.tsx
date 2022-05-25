import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import EmptyState from 'modules/common/components/EmptyState';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Pagination from 'modules/common/components/pagination/Pagination';
import Table from 'modules/common/components/table';
import { Title } from 'modules/common/styles/main';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import BrandForm from '@erxes/ui/src/brands/components/BrandForm';
import React from 'react';
import { __ } from '../../../common/utils';
import Wrapper from '../../../layout/components/Wrapper';
import Sidebar from '../containers/Sidebar';
import { IBrand } from '../types';

type Props = {
  brandsTotalCount: number;
  queryParams: any;
  currentBrand: IBrand;
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class Brands extends React.Component<Props, {}> {
  renderContent() {
    const { currentBrand, queryParams, renderButton } = this.props;

    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>{__('Brand name')}</th>
              <th>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            <Sidebar
              currentBrandId={currentBrand._id}
              queryParams={queryParams}
              renderButton={renderButton}
            />
          </tbody>
        </Table>
        <Pagination count={10} />
      </>
    );
  }

  render() {
    const { brandsTotalCount, currentBrand, loading } = this.props;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Brands'), link: '/settings/brands' },
      { title: `${currentBrand.name || ''}` }
    ];

    const addBrand = (
      <Button
        id={'NewBrandButton'}
        btnStyle="success"
        block={true}
        icon="plus-circle"
      >
        Add New Brand
      </Button>
    );

    const content = props => (
      <BrandForm
        {...props}
        extended={true}
        renderButton={this.props.renderButton}
      />
    );

    const leftActionBar = <Title>{currentBrand.name}</Title>;

    const righActionBar = (
      <ModalTrigger
        size="lg"
        title="New Brand"
        autoOpenKey="showBrandAddModal"
        trigger={addBrand}
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
          <Wrapper.ActionBar left={leftActionBar} right={righActionBar} />
        }
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={brandsTotalCount}
            emptyText="There is no brand."
            emptyImage="/images/actions/20.svg"
          />
        }
        footer={currentBrand._id && <Pagination count={brandsTotalCount} />}
      />
    );
  }
}

export default Brands;
