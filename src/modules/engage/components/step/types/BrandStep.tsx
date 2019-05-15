import { Show } from 'modules/engage/styles';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { BrandForm } from '../forms';
import Common from './Common';

type Props = {
  brandId: string;
  renderContent: any;
  brands: IBrand[];
  counts: any;
  onChange: (name: 'brandId', value: string) => void;
  brandAdd: (params: { doc: { name: string; description: string } }) => void;
};

type State = {
  brandId: string;
  createBrand: boolean;
};

class BrandStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      brandId: props.brandId || '',
      createBrand: false
    };
  }

  createBrand = (createBrand: boolean) => {
    this.setState({ createBrand });

    if (createBrand === true) {
      this.changeBrand('');
    }
  };

  changeBrand = (brandId: string) => {
    this.setState({ brandId });
    this.props.onChange('brandId', brandId);
  };

  renderComponentContent = ({
    actionSelector,
    customerCounts,
    listContent
  }) => {
    const { renderContent, brandAdd } = this.props;
    const { createBrand } = this.state;

    const componentContent = (
      <>
        {listContent}
        <Show show={createBrand}>
          <BrandForm create={brandAdd} createBrand={this.createBrand} />
        </Show>
      </>
    );

    return renderContent({ actionSelector, componentContent, customerCounts });
  };

  render() {
    const { brands, counts } = this.props;
    const { brandId, createBrand } = this.state;

    const onChange = () => this.createBrand(false);
    const onChangeBrand = () => this.createBrand(true);

    return (
      <Common
        id={brandId}
        type="brand"
        name="createBrand"
        onChange={onChange}
        onChangeToggle={onChangeBrand}
        changeList={this.changeBrand}
        listCount={counts}
        customers={counts[brandId] || 0}
        list={brands}
        checked={createBrand}
        content={this.renderComponentContent}
      />
    );
  }
}

export default BrandStep;
