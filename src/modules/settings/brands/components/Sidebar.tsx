import {
  EmptyState,
  Icon,
  LoadMore,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { BrandForm, BrandRow } from '.';
import { IBrand } from '../types';

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
    const { Header } = LeftSidebar;

    const addBrand = (
      <HelperButtons>
        <button>
          <Icon icon="add" />
        </button>
      </HelperButtons>
    );

    const content = props => (
      <BrandForm {...props} renderButton={this.props.renderButton} />
    );

    return (
      <Header uppercase={true}>
        {__('Brands')}

        <ModalTrigger title="New Brand" trigger={addBrand} content={content} />
      </Header>
    );
  }

  render() {
    const { loading, brandsTotalCount } = this.props;

    return (
      <LeftSidebar wide={true} full={true} header={this.renderSidebarHeader()}>
        <List>
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
