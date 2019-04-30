import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import Common from './Common';

type Props = {
  brandId: string;
  renderContent: any;
  brands: IBrand[];
  onChange: (name: 'brandId', value: string) => void;
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

  render() {
    const { renderContent, brands } = this.props;
    const { brandId, createBrand } = this.state;

    const onChange = () => this.createBrand(false);
    const onChangeBrand = () => this.createBrand(true);
    const content = args => <>{renderContent(args)}</>;

    return (
      <Common
        content={content}
        customers={0}
        name="createBrand"
        checked={createBrand}
        onChange={onChange}
        onChangeToggle={onChangeBrand}
        title="brand"
        list={brands}
        listCount={0}
        changeList={this.changeBrand}
        id={brandId}
      />
    );
  }
}

export default BrandStep;
