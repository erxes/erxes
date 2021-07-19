import Button from 'modules/common/components/Button';
import EmptyState from 'modules/common/components/EmptyState';
import LoadMore from 'modules/common/components/LoadMore';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Spinner from 'modules/common/components/Spinner';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { IBrand } from '../types';
import BrandForm from './BrandForm';
import BrandRow from './BrandRow';

type Props = {
  brands: IBrand[];
  remove: (brandId: string) => void;
  loading: boolean;
  currentBrandId?: string;
  brandsTotalCount: number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class Sidebar extends React.Component<Props, {}> {
  renderItems = () => {
    const { brands, remove, currentBrandId, renderButton } = this.props;

    return brands.map(brand => (
      <BrandRow
        key={brand._id}
        isActive={currentBrandId === brand._id}
        brand={brand}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  renderSidebarHeader() {
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

    return (
      <TopHeader>
        <ModalTrigger
          size="lg"
          title="New Brand"
          autoOpenKey="showBrandAddModal"
          trigger={addBrand}
          content={content}
        />
      </TopHeader>
    );
  }

  render() {
    const { loading, brandsTotalCount } = this.props;

    return (
      <LeftSidebar wide={true} full={true} header={this.renderSidebarHeader()}>
        <List id={'BrandSidebar'}>
          {this.renderItems()}
          <LoadMore all={brandsTotalCount} loading={loading} />
        </List>
        {loading && <Spinner />}
        {!loading && brandsTotalCount === 0 && (
          <EmptyState image="/images/actions/18.svg" text="There is no brand" />
        )}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
