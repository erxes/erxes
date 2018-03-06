import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { SidebarList as List } from 'modules/layout/styles';
import { BrandForm } from '../containers';
import { BrandRow } from './';
import { RightButton } from '../../styles';
import {
  Icon,
  ModalTrigger,
  EmptyState,
  LoadMore,
  Spinner
} from 'modules/common/components';

const propTypes = {
  brands: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  currentBrandId: PropTypes.string,
  brandsTotalCount: PropTypes.number.isRequired
};

const contextTypes = {
  __: PropTypes.func
};

class Sidebar extends Component {
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
    const { __ } = this.context;

    const addBrand = (
      <RightButton>
        <Icon icon="plus" />
      </RightButton>
    );

    return (
      <Header uppercase bold>
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
      <LeftSidebar full header={this.renderSidebarHeader()}>
        <List>
          {this.renderItems()}
          <LoadMore all={brandsTotalCount} />
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

Sidebar.propTypes = propTypes;
Sidebar.contextTypes = contextTypes;

export default Sidebar;
