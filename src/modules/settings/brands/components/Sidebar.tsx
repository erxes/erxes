import * as React from 'react';
import { BrandForm, BrandRow } from '.';
import {
  EmptyState,
  Icon,
  LoadMore,
  ModalTrigger,
  Spinner
} from '../../../common/components';
import { __ } from '../../../common/utils';
import { Sidebar as LeftSidebar } from '../../../layout/components';
import { HelperButtons, SidebarList as List } from '../../../layout/styles';
import { IBrand } from '../types';

type Props = {
  brands: IBrand[];
  remove: (brandId: string) => void;
  save: (
    params: {
      doc: {
        name: string;
        description: string;
      };
    },
    callback: () => void,
    brand?: IBrand
  ) => void;
  loading: boolean;
  currentBrandId?: string;
  brandsTotalCount: number;
};

class Sidebar extends React.Component<Props, {}> {
  renderItems = () => {
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
  };

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

    const content = props => <BrandForm {...props} save={save} />;

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
