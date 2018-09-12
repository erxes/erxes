import {
  EmptyState,
  Icon,
  LoadMore,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList as List } from 'modules/layout/styles';
import React, { Component } from 'react';
import { BrandForm } from '../containers';
import { IBrand } from '../types';
import { BrandRow } from './';

type Props = {
  brands: IBrand[],
  remove: (_id: string) => void,
  save: ({ doc }: { doc: any; }, callback: () => void, brand: IBrand) => void,
  loading: boolean,
  currentBrandId?: string,
  brandsTotalCount: number
};

class Sidebar extends Component<Props, {}>  {
  constructor(props) {
    super(props);

    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    const { brands, remove, save, currentBrandId } = this.props;

    return brands.map(brand => (
      <BrandRow
        key={brand._id}
        isActive={currentBrandId === brand._id}
        brand={brand}
        remove={remove}
        save={save}
      />
    ));
  }

  renderBrandForm(props) {
    return <BrandForm {...props} />;
  }

  renderSidebarHeader() {
    const { save } = this.props;
    const { Header } = LeftSidebar;

    const addBrand = (
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    return (
      <Header uppercase>
        {__('Brands')}
        <ModalTrigger title="New Brand" trigger={addBrand}>
          {this.renderBrandForm({ save })}
        </ModalTrigger>
      </Header>
    );
  }

  render() {
    const { loading, brandsTotalCount } = this.props;

    return (
      <LeftSidebar wide full header={this.renderSidebarHeader()}>
        <List>
          {this.renderItems()}
          <LoadMore all={brandsTotalCount} loading={loading} />
        </List>
        {loading && <Spinner />}
        {!loading &&
          brandsTotalCount === 0 && (
            <EmptyState
              image="/images/robots/robot-03.svg"
              text="There is no brand"
            />
          )}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
