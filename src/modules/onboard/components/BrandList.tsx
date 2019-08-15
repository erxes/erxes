import Chip from 'modules/common/components/Chip';
import { IBrand } from 'modules/settings/brands/types';
import React from 'react';

type Props = {
  brands: IBrand[];
  loading: boolean;
  remove: (brandId: string) => void;
};

class BrandList extends React.Component<Props, {}> {
  renderItems = () => {
    const { brands, remove } = this.props;

    return brands.map(brand => (
      <Chip key={brand._id} onClick={remove.bind(null, brand._id)}>
        {brand.name}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default BrandList;
