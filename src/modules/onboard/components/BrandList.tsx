import {
  Button,
  Chip,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from 'modules/common/components';
import { IBrand } from 'modules/settings/brands/types';
import * as React from 'react';
import styled from 'styled-components';
import { Footer, ScrollContent, TopContent } from './styles';

const BrandItem = styled.div``;

type Props = {
  brands: IBrand[];
  loading: boolean;
  remove: (brandId: string) => void;
};

class BrandList extends React.Component<Props, {}> {
  renderItems = () => {
    const { brands, remove } = this.props;

    return brands.map(brand => (
      <Chip key={brand._id} onClickClose={remove.bind(null, brand._id)}>
        {' '}
        {brand.name}
      </Chip>
    ));
  };

  render() {
    return <div>{this.renderItems()}</div>;
  }
}

export default BrandList;
