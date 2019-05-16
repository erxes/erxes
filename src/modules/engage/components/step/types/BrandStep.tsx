import { Show } from 'modules/engage/styles';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import { BrandForm } from '../forms';
import Common from './Common';

type Props = {
  brandIds: string[];
  renderContent: any;
  brands: IBrand[];
  counts: any;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  brandAdd: (params: { doc: { name: string; description: string } }) => void;
};

type State = {
  brandIds: string[];
  createBrand: boolean;
};

class BrandStep extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      brandIds: props.brandIds || [],
      createBrand: false
    };
  }

  createBrand = (createBrand: boolean) => {
    this.setState({ createBrand });

    if (createBrand === true) {
      this.changeBrand([]);
    }
  };

  changeBrand = (brandIds: string[]) => {
    this.setState({ brandIds }, () => {
      this.props.onChange('brandIds', brandIds);
    });
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
    const { brandIds, createBrand } = this.state;

    const onChange = () => this.createBrand(false);
    const onChangeBrand = () => this.createBrand(true);

    return (
      <Common
        ids={brandIds}
        type="brand"
        name="createBrand"
        onChange={onChange}
        onChangeToggle={onChangeBrand}
        changeList={this.changeBrand}
        counts={counts}
        customers={0}
        list={brands}
        checked={createBrand}
        content={this.renderComponentContent}
      />
    );
  }
}

export default BrandStep;
